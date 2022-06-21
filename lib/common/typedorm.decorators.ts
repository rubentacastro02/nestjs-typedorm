import { Inject } from "@nestjs/common";
import { BatchManager, Connection, EntityManager } from "@typedorm/core";
import { ScanManager } from "@typedorm/core/src/classes/manager/scan-manager";

export const InjectEntityManager = () => Inject(EntityManager);

export const InjectEntityBatchManager = () => Inject(BatchManager);

export const InjectScanManager = () => Inject(ScanManager);

export const InjectConnection = () => Inject(Connection);
