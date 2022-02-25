/// <reference types="react-scripts" />
declare module "*.module.less" {
  const classes: { [key: string]: string };
  export default classes;
}

type RefType = MutableRefObject<unknown> | ((instance: unknown) => void)

type CommonObjectType<T = any> = Record<string, T>