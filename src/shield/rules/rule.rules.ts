import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { Rule } from '../../rules/models/rule.model';

export const isPublicRule = rule({ cache: 'strict' })(
  async (parent: Rule, _args, { services: { rulesService } }: Context) =>
    rulesService.isPublicRule(parent.id),
);
