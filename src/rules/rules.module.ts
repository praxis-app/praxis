import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rule } from './models/rule.model';
import { RulesResolver } from './rules.resolver';
import { RulesService } from './rules.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rule])],
  providers: [RulesService, RulesResolver],
  exports: [RulesService],
})
export class RulesModule {}
