import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConnectionOptions } from "@typedorm/core";

import { TypeDormModuleAsyncOptions } from "./typedorm.interfaces";
import { TypeDormCoreModule } from "./typedorm-core.module";

@Global()
@Module({})
export class TypeDormModule {
  public static forRoot(options: ConnectionOptions): DynamicModule {
    return {
      module: TypeDormModule,
      imports: [TypeDormCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options: TypeDormModuleAsyncOptions): DynamicModule {
    return {
      module: TypeDormModule,
      imports: [TypeDormCoreModule.forRootAsync(options)],
    };
  }
}
