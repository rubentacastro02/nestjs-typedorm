import { ModuleMetadata, Type } from "@nestjs/common/interfaces";
import { EntityTarget, Table } from "@typedorm/common";

export interface TypeDormOptionsFactory {
  createTypeDormOptions(
    connectionName?: string
  ): Promise<TypeDormModuleOptions> | TypeDormModuleOptions;
}

export interface TypeDormModuleOptions {
  table?: Table;
  name?: string;
  entities: EntityTarget<any>[] | string;
  endpoint?: string;
  region?: string;
}

export interface TypeDormModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  name?: string;
  useExisting?: Type<TypeDormOptionsFactory>;
  useClass?: Type<TypeDormOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<TypeDormModuleOptions> | TypeDormModuleOptions;
  inject?: any[];
}
