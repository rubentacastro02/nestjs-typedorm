import { Logger } from "@nestjs/common";
import {
  BatchManager,
  Connection,
  ConnectionOptions,
  createConnection,
  EntityManager,
  getBatchManager,
  getConnection,
  getEntityManager,
  getScanManager,
} from "@typedorm/core";
import { ScanManager } from "@typedorm/core/src/classes/manager/scan-manager";

const logger = new Logger("TypeDormModule");

export function createTypeDormProviders(config: ConnectionOptions) {
  const connectionProvider = {
    provide: Connection,
    useFactory: async () => {
      createConnection({
        table: config.table,
        entities: config.entities || [],
        documentClient: config.documentClient,
      });

      logger.log("Database connected");
      return getConnection();
    },
  };

  const entityManagerProviders = [
    {
      provide: EntityManager,
      useFactory: (connection: Connection) => getEntityManager(connection.name),
      inject: [Connection],
    },
  ];

  const scanManagerProviders = [
    {
      provide: ScanManager,
      useFactory: (connection: Connection) => getScanManager(connection.name),
      inject: [Connection],
    },
  ];

  const batchManagerProviders = [
    {
      provide: BatchManager,
      useFactory: (connection: Connection) => getBatchManager(connection.name),
      inject: [Connection],
    },
  ];

  return [
    connectionProvider,
    ...entityManagerProviders,
    ...scanManagerProviders,
    ...batchManagerProviders,
  ];
}
