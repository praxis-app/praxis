import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Event } from "./models/event.model";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>
  ) {}

  async getEvent(where: FindOptionsWhere<Event>, relations?: string[]) {
    return this.eventRepository.findOneOrFail({ where, relations });
  }

  async getEvents(where?: FindOptionsWhere<Event>, relations?: string[]) {
    return this.eventRepository.find({
      order: { updatedAt: "DESC" },
      relations,
      where,
    });
  }
}
