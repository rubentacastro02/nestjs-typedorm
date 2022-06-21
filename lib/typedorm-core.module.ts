import {
  DynamicModule,
  Global,
  Logger,
  Module,
  OnModuleInit,
  Provider,
  Type,
} from "@nestjs/common";
import { Connection, createConnection } from "@typedorm/core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuid } from "uuid";

import { TYPEDORM_MODULE_ID, TYPEDORM_MODULE_OPTIONS } from "./typedorm.constants";
import {
  TypeDormModuleAsyncOptions,
  TypeDormModuleOptions,
  TypeDormOptionsFactory,
} from "./interfaces";
import { TypeDormModule } from "./typedorm.module";
import { createTypeDormProviders } from "./typedorm.providers";
import {
  batchScanManagerToken,
  getConnectionToken,
  getEntityManagerToken,
  getScanManagerToken,
} from "./common/typedorm.utils";

@Global()
@Module({})
export class TypeDormCoreModule implements OnModuleInit {
  private readonly logger = new Logger("TypeDormModule");

  public static forRoot(config: TypeDormModuleOptions): DynamicModule {
    (config as any).entities = config.entities;
    const providers = createTypeDormProviders(config);
    return {
      module: TypeDormModule,
      providers: providers,
      exports: providers,
    };
  }

  public static forRootAsync(options: TypeDormModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(options as TypeDormModuleOptions) as string,
      useFactory: async (typeDormOptions: TypeDormModuleOptions) => {
        const name = options.name ?? typeDormOptions.name;

        if (typeDormOptions.endpoint) {
          return createConnection({
            name: name,
            table: typeDormOptions.table,
            entities: typeDormOptions.entities,
            documentClient: new DocumentClient({
              endpoint: typeDormOptions.endpoint,
              region: typeDormOptions.region,
            }),
          });
        }

        return createConnection({
          name: name,
          table: typeDormOptions.table,
          entities: typeDormOptions.entities,
          documentClient: new DocumentClient({
            region: typeDormOptions.region,
          }),
        });
      },
      inject: [TYPEDORM_MODULE_OPTIONS],
    };

    const entityManagerProvider = {
      provide: getEntityManagerToken(options as TypeDormModuleOptions) as string,
      useFactory: (connection: Connection) => connection.entityManager,
      inject: [getConnectionToken(options as TypeDormModuleOptions)],
    };

    const scanManagerProvider = {
      provide: getScanManagerToken(options as TypeDormModuleOptions) as string,
      useFactory: (connection: Connection) => connection.scanManager,
      inject: [getConnectionToken(options as TypeDormModuleOptions)],
    };

    const batchManagerProvider = {
      provide: batchScanManagerToken(options as TypeDormModuleOptions) as string,
      useFactory: (connection: Connection) => connection.scanManager,
      inject: [getConnectionToken(options as TypeDormModuleOptions)],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: TypeDormCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        entityManagerProvider,
        scanManagerProvider,
        batchManagerProvider,
        connectionProvider,
        {
          provide: TYPEDORM_MODULE_ID,
          useValue: uuid(),
        },
      ],
      exports: [
        entityManagerProvider,
        scanManagerProvider,
        batchManagerProvider,
        connectionProvider,
      ],
    };
  }

  private static createAsyncOptionsProvider(options: TypeDormModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: TYPEDORM_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<TypeOrmOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [(options.useClass || options.useExisting) as Type<TypeDormOptionsFactory>];
    return {
      provide: TYPEDORM_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TypeDormOptionsFactory) =>
        await optionsFactory.createTypeDormOptions(options.name),
      inject,
    };
  }

  private static createAsyncProviders(options: TypeDormModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<TypeDormOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  onModuleInit() {
    this.logger.log("The module has been initialised.");
  }
}
