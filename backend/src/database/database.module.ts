import { Module } from '@nestjs/common';
import { IDatabaseClient } from './clients/i.database.client';
import { DatabaseClient } from './clients/implementations/database.client';

@Module({
  exports: [IDatabaseClient],
  providers: [
    {
      provide: IDatabaseClient,
      useClass: DatabaseClient,
    },
  ],
})
export class DatabaseModule {}
