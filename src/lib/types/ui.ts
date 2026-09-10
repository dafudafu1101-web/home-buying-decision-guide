export interface ChoiceOption<T extends string> {
  value: T;
  title: string;
  desc?: string;
}
