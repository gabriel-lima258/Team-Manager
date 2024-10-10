import { CampaignLeadsController } from "../controllers/CampaignLeadsController";
import { CampaignsController } from "../controllers/CampaignsController";
import { GroupLeadsController } from "../controllers/GroupLeadsController";
import { GroupsController } from "../controllers/GroupsController";
import { LeadsController } from "../controllers/LeadsController";
import { PrismaGroupsRepository } from "../repositories/prisma/PrismaGroupsRepository";
import { PrismaLeadsRepository } from "../repositories/prisma/PrismaLeadsRepository";

export const leadsRepository = new PrismaLeadsRepository()
export const groupsRepository = new PrismaGroupsRepository()

export const leadsController = new LeadsController(leadsRepository);
export const groupsController = new GroupsController(groupsRepository);
export const groupLeadsController = new GroupLeadsController(groupsRepository, leadsRepository);
export const campaignController = new CampaignsController();
export const campaignLeadsController = new CampaignLeadsController();