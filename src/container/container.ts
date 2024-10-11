import { CampaignLeadsController } from "../controllers/CampaignLeadsController";
import { CampaignsController } from "../controllers/CampaignsController";
import { GroupLeadsController } from "../controllers/GroupLeadsController";
import { GroupsController } from "../controllers/GroupsController";
import { LeadsController } from "../controllers/LeadsController";
import { PrismaCampaignsRepository } from "../repositories/prisma/PrismaCampaignsRepository";
import { PrismaGroupsRepository } from "../repositories/prisma/PrismaGroupsRepository";
import { PrismaLeadsRepository } from "../repositories/prisma/PrismaLeadsRepository";
import { GroupLeadsService } from "../use-cases/GroupLeadsService";
import { GroupsService } from "../use-cases/GroupsService";
import { LeadsService } from "../use-cases/LeadsService";

// Repositories 
export const leadsRepository = new PrismaLeadsRepository()
export const groupsRepository = new PrismaGroupsRepository()
export const campaignsRepository = new PrismaCampaignsRepository()

// Use cases from controllers
export const leadsService = new LeadsService(leadsRepository)
export const groupsService = new GroupsService(groupsRepository)
export const groupLeadsService = new GroupLeadsService(groupsRepository, leadsRepository)

// Controllers
export const leadsController = new LeadsController(leadsService);
export const groupsController = new GroupsController(groupsService);
export const groupLeadsController = new GroupLeadsController(groupLeadsService);
export const campaignController = new CampaignsController(campaignsRepository);
export const campaignLeadsController = new CampaignLeadsController(campaignsRepository, leadsRepository);