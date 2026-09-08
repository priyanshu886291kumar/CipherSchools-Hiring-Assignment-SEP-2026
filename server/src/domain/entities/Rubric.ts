import { RubricDimension, RubricDimensionMetadata } from '../enums/RubricDimension';

export interface IRubricItem {
  dimension: RubricDimension;
  weight: number;
  specificGuidance?: string[];
}

export class Rubric {
  public readonly items: IRubricItem[];

  constructor(items?: IRubricItem[]) {
    if (items && items.length > 0) {
      this.items = items;
    } else {
      this.items = (Object.keys(RubricDimension) as RubricDimension[]).map((dim) => ({
        dimension: dim,
        weight: RubricDimensionMetadata[dim].defaultWeight,
      }));
    }
    this.normalizeWeights();
  }

  private normalizeWeights(): void {
    const totalWeight = this.items.reduce((acc, item) => acc + item.weight, 0);
    if (totalWeight !== 100 && totalWeight > 0) {
      // Adjust proportionally
      this.items.forEach((item) => {
        item.weight = Math.round((item.weight / totalWeight) * 100);
      });
    }
  }

  public getWeightForDimension(dim: RubricDimension): number {
    const item = this.items.find((i) => i.dimension === dim);
    return item ? item.weight : RubricDimensionMetadata[dim].defaultWeight;
  }

  public toJSON(): IRubricItem[] {
    return this.items;
  }

  public static defaultRubric(): Rubric {
    return new Rubric();
  }
}
