import { EntityRepository, Repository } from 'typeorm';

import { Organisation } from '../entities';

@EntityRepository(Organisation)
export class OrganisationRepository extends Repository<Organisation> {}
