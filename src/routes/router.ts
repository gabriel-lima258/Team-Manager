import { Router } from "express";
import { leadsController, groupsController, campaignController, campaignLeadsController, groupLeadsController } from "../container/container";

const router  = Router()

router.get('/leads', leadsController.index)
router.post('/leads', leadsController.create)
router.get('/leads/:id', leadsController.show)
router.put('/leads/:id', leadsController.update)
router.delete('/leads/:id', leadsController.delete)

router.get('/groups', groupsController.index)
router.post('/groups', groupsController.create)
router.get('/groups/:id', groupsController.show)
router.put('/groups/:id', groupsController.update)
router.delete('/groups/:id', groupsController.delete)

router.get('/campaigns', campaignController.index)
router.post('/campaigns', campaignController.create)
router.get('/campaigns/:id', campaignController.show)
router.put('/campaigns/:id', campaignController.update)
router.delete('/campaigns/:id', campaignController.delete)

router.get("/campaigns/:campaignId/leads", campaignLeadsController.getLeads)
router.post("/campaigns/:campaignId/leads", campaignLeadsController.addLead)
router.put("/campaigns/:campaignId/leads/:leadId", campaignLeadsController.updateLeadStatus)
router.delete("/campaigns/:campaignId/leads/:leadId", campaignLeadsController.removeLead)

router.get("/groups/:groupId/leads", groupLeadsController.getLeads)
router.post("/groups/:groupId/leads", groupLeadsController.addLead)
router.delete("/groups/:groupId/leads/:leadId", groupLeadsController.removeLead)

export { router }