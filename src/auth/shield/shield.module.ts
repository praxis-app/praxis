import { Module } from "@nestjs/common";
import { ShieldService } from "./shield.service";

@Module({
  providers: [ShieldService],
  exports: [ShieldService],
})
export class ShieldModule {}
