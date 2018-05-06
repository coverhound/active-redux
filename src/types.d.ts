import { ThunkAction } from 'redux-thunk';
import { Store as OriginalStore, Reducer, AnyAction } from 'redux';

export interface State { api: any }

export interface StaticAttribute {
  type: string;
  name?: string;
  cast(value: any): any;
}

export interface Relationship {
  type: string;
  name?: string;
  resource: string;
  isArray: boolean;
}

export type Attribute = StaticAttribute | Relationship;

export interface AttributeMap { [s: string]: Attribute }

export interface JSONAPIObject {
  id: string;
  type: string;
  attributes?: Object;
}

export interface ModelBaseClass extends Function {
  new(data: Object): ModelBaseClass;
  attributes?: AttributeMap;
  endpoints?: Object;
}

export interface AnyReducer extends Reducer<any> {}

export interface ExtensibleReducer {
  (state: State, action: AnyAction): any;
  extend?: (AnyReducer) => AnyReducer;
}

export interface ReduxStore extends OriginalStore<State> {}

export type DataArray = Array<any> & { isFetching?: boolean };

export interface AttributeParams {
  name?: string;
  isType(any): boolean;
  cast(any): any;
  defaultValue: any;
  nullable: boolean;
}

