import { Problem } from '../domain/entities/Problem';
import { Difficulty } from '../domain/enums/Difficulty';
import { Rubric } from '../domain/entities/Rubric';
import { RubricDimension } from '../domain/enums/RubricDimension';

export const sampleProblems: Problem[] = [
  new Problem({
    id: 'prob-1',
    slug: 'parking-lot-system',
    title: 'Design a Multi-Floor Parking Lot System',
    difficulty: Difficulty.MEDIUM,
    estimatedMinutes: 45,
    shortDescription: 'Design an automated multi-floor parking lot supporting different vehicle types, dynamic spot allocation, and pluggable pricing models.',
    fullDescription: `
### Scenario
A smart multi-story parking facility requires an automated management system to handle vehicle check-in, real-time spot allocation, ticket generation, payment processing, and checkout.

The facility accommodates compact cars, large trucks/buses, and motorcycles across multiple floors. Management wants the flexibility to change pricing strategies (e.g. flat hourly vs dynamic peak-hour surge) without redesigning the core system.
    `,
    functionalRequirements: [
      'The parking lot has multiple floors, each with multiple parking spots.',
      'Spots are categorized by size: Motorcycle (Small), Compact (Medium), Large (Truck/Bus), and Electric Vehicle (EV).',
      'System must assign the nearest available valid spot to an incoming vehicle upon entry.',
      'A Ticket is issued containing ticket ID, vehicle registration, assigned spot, and entry timestamp.',
      'Upon exit, system calculates the parking fee based on duration and applicable Pricing Strategy.',
      'System marks the spot available once payment is settled and vehicle departs.',
      'Display boards at entry show real-time free spot counts per floor and vehicle category.',
    ],
    nonFunctionalRequirements: [
      'Thread-Safe: Multiple entry and exit gates operate concurrently without double-booking spots.',
      'Extensibility (Open-Closed Principle): Easy addition of new vehicle types or pricing algorithms (e.g. VIP discount, holiday rates).',
      'Low latency: Spot assignment must execute in constant or sub-linear time.',
    ],
    constraints: [
      'In-memory state with fast lookup.',
      'Vehicle cannot park in a spot smaller than its required type.',
    ],
    hints: [
      'Use Strategy Pattern for pricing calculation (HourlyPricingStrategy, DynamicSurgePricingStrategy).',
      'Use Factory Pattern for instantiating different vehicle types.',
      'Consider Singleton or Dependency Injection for the ParkingManager.',
      'Use proper synchronization/locks when allocating spots to avoid race conditions.',
    ],
    keyEntitiesExpected: [
      'ParkingLot',
      'ParkingFloor',
      'ParkingSpot',
      'Vehicle',
      'Ticket',
      'Payment',
      'IPricingStrategy',
      'ISpotAssignmentStrategy',
      'ParkingDisplayBoard',
    ],
    sampleApproach: `
1. Define Vehicle hierarchy: abstract Vehicle with subclasses Motorcycle, Car, Truck.
2. Define ParkingSpot hierarchy: MotorcycleSpot, CompactSpot, LargeSpot, ElectricSpot with isOccupied state.
3. Decouple Pricing via IPricingStrategy interface (e.g., FlatRateStrategy, HourlyDynamicStrategy).
4. Decouple Spot Allocation via ISpotAssignmentStrategy (e.g., NearestFirstStrategy, BestFitStrategy).
5. Orchestrate through ParkingLot / ParkingManager using thread-safe data structures (ConcurrentHashMap or synchronized blocks).
    `,
    starterTemplate: {
      requirementsAndAssumptions: `### Clarifications & Scope:
- In-memory system with 3 floors, each having 50 spots (20 compact, 15 large, 10 motorcycle, 5 EV).
- Concurrent entry gates (Gate 1, Gate 2) and exit gates.
- Default pricing: $2/hr for Motorcycle, $5/hr for Car, $10/hr for Truck.

### Key Assumptions:
- Vehicles pay at the exit gate.
- Nearest spot strategy prioritizes lowest floor number then lowest spot index.`,
      classModelTextOrDiagram: `classDiagram
    class ParkingLot {
        -String id
        -List~ParkingFloor~ floors
        -ISpotAssignmentStrategy spotStrategy
        -IPricingStrategy pricingStrategy
        +assignSpot(Vehicle): Ticket
        +releaseSpot(Ticket): Invoice
    }
    class ParkingFloor {
        -int floorNumber
        -Map~SpotType, List~ParkingSpot~~ spots
        +findAvailableSpot(SpotType): ParkingSpot
    }
    class ParkingSpot {
        -String spotId
        -SpotType type
        -boolean isOccupied
        -Vehicle currentVehicle
        +park(Vehicle): void
        +vacate(): void
    }
    class Vehicle {
        <<abstract>>
        -String licensePlate
        -VehicleType type
    }
    class Ticket {
        -String ticketId
        -String licensePlate
        -ParkingSpot spot
        -Date entryTime
    }
    class IPricingStrategy {
        <<interface>>
        +calculateFee(Ticket, Date exitTime): double
    }
    ParkingLot --> ParkingFloor
    ParkingFloor --> ParkingSpot
    ParkingLot ..> IPricingStrategy`,
      designPatternsRationale: `### Design Patterns Applied:
1. **Strategy Pattern**: Applied to \`IPricingStrategy\` and \`ISpotAssignmentStrategy\` so new algorithms (e.g. SurgePricing, FirstAvailable) can be injected without modifying \`ParkingLot\`.
2. **Factory Method**: \`VehicleFactory\` encapsulates creation of specific vehicle instances.
3. **Singleton Pattern / DI**: \`ParkingLotManager\` maintains centralized state.`,
      implementationCode: `public enum VehicleType { MOTORCYCLE, CAR, TRUCK, EV }
public enum SpotType { SMALL, COMPACT, LARGE, ELECTRIC }

public interface IPricingStrategy {
    double calculateFee(Ticket ticket, long exitTimestamp);
}

public class HourlyPricingStrategy implements IPricingStrategy {
    @Override
    public double calculateFee(Ticket ticket, long exitTimestamp) {
        long durationHours = Math.max(1, (exitTimestamp - ticket.getEntryTimestamp()) / (1000 * 3600));
        switch (ticket.getVehicle().getType()) {
            case MOTORCYCLE: return durationHours * 2.0;
            case CAR: return durationHours * 5.0;
            case TRUCK: return durationHours * 10.0;
            default: return durationHours * 4.0;
        }
    }
}

public class ParkingSpot {
    private final String id;
    private final SpotType type;
    private volatile boolean occupied;
    private Vehicle parkedVehicle;

    public ParkingSpot(String id, SpotType type) {
        this.id = id;
        this.type = type;
        this.occupied = false;
    }

    public synchronized boolean park(Vehicle vehicle) {
        if (this.occupied) return false;
        this.parkedVehicle = vehicle;
        this.occupied = true;
        return true;
    }

    public synchronized void vacate() {
        this.parkedVehicle = null;
        this.occupied = false;
    }

    public boolean isOccupied() { return occupied; }
    public SpotType getType() { return type; }
    public String getId() { return id; }
}`,
      tradeoffsAndEdgeCases: `### Trade-offs:
- Chose in-memory synchronized methods on ParkingSpot for simplicity and thread-safety vs lock-free CAS primitives.
- Strategy pattern introduces extra classes but makes pricing changes 100% compliant with Open-Closed Principle.

### Edge Cases Handled:
- Lot Full: System immediately returns error when no spot matches vehicle type.
- Concurrent Gate Booking: Synchronized spot locking prevents double-allocation.
- Lost Ticket: System supports manual exit override fee.`,
    },
    rubric: new Rubric([
      { dimension: RubricDimension.REQUIREMENT_ANALYSIS, weight: 15 },
      { dimension: RubricDimension.CLASS_RESPONSIBILITY, weight: 20 },
      { dimension: RubricDimension.COUPLING_ENCAPSULATION, weight: 20 },
      { dimension: RubricDimension.DESIGN_PATTERNS, weight: 15 },
      { dimension: RubricDimension.EXTENSIBILITY_TRADEOFFS, weight: 15 },
      { dimension: RubricDimension.EDGE_CASES_TESTABILITY, weight: 15 },
    ]),
  }),

  new Problem({
    id: 'prob-2',
    slug: 'elevator-control-system',
    title: 'Design an Elevator Control System',
    difficulty: Difficulty.HARD,
    estimatedMinutes: 50,
    shortDescription: 'Design an efficient scheduling and dispatch system for multiple elevator cars operating in a high-rise building.',
    fullDescription: `
### Scenario
A modern 40-floor commercial building requires an Elevator Dispatcher and Car Control system. The building has 4 elevator cars serving floor requests from hall panels (outside the elevator) and car panels (inside the elevator).

The system must optimize for minimal passenger wait times and energy efficiency using classic elevator algorithms (e.g. SCAN / Elevator Algorithm or LOOK).
    `,
    functionalRequirements: [
      'Manage multiple elevator cars (e.g. 4 cars across 40 floors).',
      'Handle internal requests (passenger selects destination floor inside car).',
      'Handle external hall requests (passenger presses UP or DOWN button on a floor).',
      'Dispatch algorithm selects the best car to serve external requests based on proximity, current direction, and load.',
      'Elevator car transitions through states: IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, EMERGENCY_STOP.',
      'Weight sensor detects overload condition and prevents doors from closing.',
    ],
    nonFunctionalRequirements: [
      'Thread Safety: Elevator state updates and button presses from different floors occur asynchronously.',
      'Extensibility: Easy to swap dispatch algorithms (e.g. Nearest Car vs Zone-based vs SCAN/LOOK).',
      'Fault tolerance: If an elevator car fails or enters maintenance, remaining cars redistribute pending requests.',
    ],
    constraints: [
      'Elevator cannot exceed maximum capacity (e.g. 1000 kg or 12 passengers).',
      'Elevators must open doors only when fully stopped at a designated floor level.',
    ],
    hints: [
      'Use State Pattern for elevator car states (IdleState, MovingState, DoorOpenState).',
      'Use Strategy Pattern for request scheduling and dispatching (ISchedulingStrategy).',
      'Use Observer Pattern to notify UI/display panels of floor transitions and door status.',
    ],
    keyEntitiesExpected: [
      'ElevatorSystem',
      'ElevatorCar',
      'ElevatorController',
      'IElevatorState',
      'IElevatorDispatchStrategy',
      'HallRequest',
      'InternalRequest',
      'Door',
      'ButtonPanel',
    ],
    sampleApproach: `
1. Model ElevatorCar with State Pattern (Idle, MovingUp, MovingDown, DoorOpen).
2. Represent internal and external requests as Request value objects.
3. Implement Dispatcher with Strategy Pattern (LOOK/SCAN or Shortest Seek Time).
4. Maintain thread-safe priority queues (one for UP, one for DOWN) per elevator car.
    `,
    rubric: new Rubric([
      { dimension: RubricDimension.REQUIREMENT_ANALYSIS, weight: 15 },
      { dimension: RubricDimension.CLASS_RESPONSIBILITY, weight: 20 },
      { dimension: RubricDimension.COUPLING_ENCAPSULATION, weight: 20 },
      { dimension: RubricDimension.DESIGN_PATTERNS, weight: 20 },
      { dimension: RubricDimension.EXTENSIBILITY_TRADEOFFS, weight: 10 },
      { dimension: RubricDimension.EDGE_CASES_TESTABILITY, weight: 15 },
    ]),
  }),

  new Problem({
    id: 'prob-3',
    slug: 'vending-machine-state-machine',
    title: 'Design a Vending Machine (State Pattern)',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 35,
    shortDescription: 'Design an automated vending machine with finite state machine transitions, coin/bill change calculation, and inventory management.',
    fullDescription: `
### Scenario
Design the internal software for a snack & beverage vending machine. The machine supports item selection, accepting physical cash/coins or card payment, validating inserted amount, dispensing items, and returning exact change.

The machine operates as a classic Finite State Machine (FSM) to prevent invalid operations (e.g. dispensing before payment or accepting coins while dispensing).
    `,
    functionalRequirements: [
      'Machine holds multiple inventory racks/slots, each containing an item type, price, and stock count.',
      'User selects a product code (e.g., A1, B2).',
      'User inserts coins/cash or selects digital payment.',
      'Machine validates payment: if sufficient, dispenses item and returns optimal change.',
      'If user cancels transaction before dispensing, all inserted money is refunded.',
      'Handles out-of-stock items and insufficient change conditions gracefully.',
    ],
    nonFunctionalRequirements: [
      'State Pattern: Clean transition between states: ReadyState, HasMoneyState, DispensingState, SoldOutState.',
      'No invalid state actions: Calling dispense() in ReadyState throws an exception.',
      'Greedy / Dynamic Programming coin change calculation.',
    ],
    constraints: [
      'Exact change only if machine coin inventory is depleted.',
    ],
    hints: [
      'State Pattern is ideal here: create IVendingState interface with methods insertCoin(), selectItem(), dispense(), refund().',
      'Keep inventory management in a separate Inventory class rather than bloating VendingMachine.',
    ],
    keyEntitiesExpected: [
      'VendingMachine',
      'IVendingState',
      'ReadyState',
      'HasMoneyState',
      'DispensingState',
      'Inventory',
      'Item',
      'Coin',
      'CashRegister',
    ],
    sampleApproach: `
1. Define IVendingState with state transitions.
2. Implement Concrete States: ReadyState, HasMoneyState, DispensingState.
3. Manage Item slots and Coin denomination maps cleanly in Inventory and CashRegister.
    `,
    rubric: new Rubric([
      { dimension: RubricDimension.REQUIREMENT_ANALYSIS, weight: 15 },
      { dimension: RubricDimension.CLASS_RESPONSIBILITY, weight: 20 },
      { dimension: RubricDimension.COUPLING_ENCAPSULATION, weight: 20 },
      { dimension: RubricDimension.DESIGN_PATTERNS, weight: 25 },
      { dimension: RubricDimension.EXTENSIBILITY_TRADEOFFS, weight: 10 },
      { dimension: RubricDimension.EDGE_CASES_TESTABILITY, weight: 10 },
    ]),
  }),

  new Problem({
    id: 'prob-4',
    slug: 'rate-limiter',
    title: 'Design an In-Memory Rate Limiter',
    difficulty: Difficulty.MEDIUM,
    estimatedMinutes: 45,
    shortDescription: 'Design an extensible in-memory rate limiting library supporting Token Bucket, Sliding Window Log, and Leaky Bucket algorithms.',
    fullDescription: `
### Scenario
Design a high-throughput, low-latency rate limiting component used by API gateways to protect backend microservices from denial-of-service traffic and API abuse.

The library must support per-client or per-IP throttling, configurable time windows, and swappable rate limiting algorithms without modifying the gateway middleware.
    `,
    functionalRequirements: [
      'Support allowRequest(clientId): boolean method returning true if within quota or false if throttled.',
      'Support multiple rate-limiting algorithms (Token Bucket, Sliding Window Counter, Leaky Bucket).',
      'Allow per-endpoint and per-client tier configurations (e.g. Free Tier: 10 req/min, Premium: 100 req/min).',
      'Provide headers or response metadata: remaining tokens, reset timestamp.',
    ],
    nonFunctionalRequirements: [
      'Thread Safety: High concurrent access across hundreds of threads without race conditions or memory leaks.',
      'Memory Efficiency: Expired window logs or idle client buckets must be evicted periodically.',
      'Extensibility: Strategy pattern for algorithms.',
    ],
    constraints: [
      'Sub-millisecond execution time per check.',
    ],
    hints: [
      'Use Strategy Pattern for IRateLimitingAlgorithm.',
      'Use ConcurrentHashMap and atomic primitives (AtomicInteger, AtomicLong) or ReentrantLock.',
      'Consider sliding window log vs token bucket memory and CPU trade-offs.',
    ],
    keyEntitiesExpected: [
      'RateLimiter',
      'IRateLimitStrategy',
      'TokenBucketStrategy',
      'SlidingWindowLogStrategy',
      'ClientQuotaConfig',
      'RateLimitResult',
    ],
    sampleApproach: `
1. Define IRateLimitStrategy interface with isAllowed(clientId).
2. Implement TokenBucketStrategy with lazy refill on access.
3. Implement SlidingWindowLogStrategy with Deque of timestamps.
4. Wrap in RateLimiterManager providing thread-safe concurrency.
    `,
    rubric: new Rubric([
      { dimension: RubricDimension.REQUIREMENT_ANALYSIS, weight: 15 },
      { dimension: RubricDimension.CLASS_RESPONSIBILITY, weight: 20 },
      { dimension: RubricDimension.COUPLING_ENCAPSULATION, weight: 20 },
      { dimension: RubricDimension.DESIGN_PATTERNS, weight: 15 },
      { dimension: RubricDimension.EXTENSIBILITY_TRADEOFFS, weight: 15 },
      { dimension: RubricDimension.EDGE_CASES_TESTABILITY, weight: 15 },
    ]),
  }),

  new Problem({
    id: 'prob-5',
    slug: 'expense-sharing-splitwise',
    title: 'Design an Expense Sharing Application (Splitwise)',
    difficulty: Difficulty.HARD,
    estimatedMinutes: 50,
    shortDescription: 'Design an expense sharing and group balance settlement system supporting Equal, Exact, and Percentage splits with debt simplification.',
    fullDescription: `
### Scenario
Design the core low-level domain for an expense sharing platform like Splitwise. Users can create groups, record expenses paid by one or multiple users, split the costs across participants using different split strategies (EQUAL, EXACT, PERCENTAGE), and view individual balance sheets.

The system should also include an algorithm/strategy to simplify group debts to minimize the total number of transactions needed to settle all balances.
    `,
    functionalRequirements: [
      'Users can add expenses within a group or non-group 1-on-1.',
      'Support 3 split types: EQUAL, EXACT amount, and PERCENTAGE split with strict sum validation (e.g. percentages must equal 100%).',
      'Maintain running balances between all pairs of users.',
      'Provide user balance view (who owes how much to whom).',
      'Debt Simplification: Compute minimal transaction graph to settle all balances in a group.',
    ],
    nonFunctionalRequirements: [
      'Strategy Pattern for Split validation and balance computation (ISplitStrategy).',
      'Clean transaction history with rollback/edit support if an expense is deleted.',
      'High domain cohesion: keep User, Group, Expense, and Split entities decoupled from settlement math.',
    ],
    constraints: [
      'Validate split amounts strictly against total expense amount before committing.',
    ],
    hints: [
      'Use Strategy Pattern for EqualSplitStrategy, ExactSplitStrategy, PercentSplitStrategy.',
      'Use Factory Pattern for creating Expense objects with their associated splits.',
      'Debt simplification can be modeled using a directed graph or min/max balance matching greedy algorithm.',
    ],
    keyEntitiesExpected: [
      'User',
      'Group',
      'Expense',
      'Split',
      'EqualSplit',
      'ExactSplit',
      'PercentSplit',
      'ISplitStrategy',
      'BalanceSheetManager',
      'IDebtSettlementAlgorithm',
    ],
    sampleApproach: `
1. Define User and Group entities with distinct user IDs.
2. Define Expense entity containing payer, total amount, and List<Split>.
3. Create ISplitStrategy for validating and calculating split allocations.
4. Maintain a BalanceSheet with user-to-user net balance maps.
5. Create MinTransactionSettlementAlgorithm for optimal debt clearance.
    `,
    rubric: new Rubric([
      { dimension: RubricDimension.REQUIREMENT_ANALYSIS, weight: 15 },
      { dimension: RubricDimension.CLASS_RESPONSIBILITY, weight: 20 },
      { dimension: RubricDimension.COUPLING_ENCAPSULATION, weight: 20 },
      { dimension: RubricDimension.DESIGN_PATTERNS, weight: 15 },
      { dimension: RubricDimension.EXTENSIBILITY_TRADEOFFS, weight: 15 },
      { dimension: RubricDimension.EDGE_CASES_TESTABILITY, weight: 15 },
    ]),
  }),
];
