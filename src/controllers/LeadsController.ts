import { Handler } from "express";
import { CreateLeadRequestSchema, GetLeadsRequestSchema, UpdateLeadRequestSchema } from "./schemas/LeadsRequestSchema";
import { HttpError } from "../errors/HttpError";
import { LeadsRepository, LeadWhereParams } from "../repositories/LeadsRepository";

export class LeadsController {
  private leadsRepository: LeadsRepository

  constructor(leadsRepository: LeadsRepository) {
    this.leadsRepository = leadsRepository;
  }

  index: Handler = async (req, res, next) => {
    try {
      // validate the request
      const query = GetLeadsRequestSchema.parse(req.query);
      const { 
        page = '1',
        pageSize = '10',
        name,
        status, 
        sortBy = "name", 
        order = "asc" 
      } = query

      // convert string to number
      const limit = Number(pageSize)
      const offset = (Number(page) - 1) * limit

      // type of request input parameters
      const where: LeadWhereParams = {}

      // verify if query contains the value
      if (name) where.name = { like: name, mode: 'insensitive' }
      if (status) where.status = status

      const leads = await this.leadsRepository.find({
        where: where,
        sortBy,
        order,
        limit,
        offset,
      })

      const total = await this.leadsRepository.count(where)

      // const leads = await prisma.lead.findMany({
      //   where,
      //   skip: (limit - 1) * offset, // initial = 0
      //   take: offset,
      //   orderBy: { [sortBy]: order } // using zod parameters
      // })
       
      // const total = await prisma.lead.count({ where })


      res.json({
        data: leads,
        meta: {
          page: Number(page),
          pageSize: limit,
          total,
          totalPages: Math.ceil(total  / limit)
        }
      })
    } catch (error) {
      next(error);
    }
  }

  create: Handler = async (req, res, next) => {
    try {
      const body = CreateLeadRequestSchema.parse(req.body);
      const newLead = await this.leadsRepository.create(body)

      // const newLead = await prisma.lead.create({
      //   data: body
      // })

      res.status(201).json(newLead)
    } catch (error) {
      next(error);
    }
  }

  show: Handler = async (req, res, next) => {
    try {
      const lead = await this.leadsRepository.findById(Number(req.params.id))
      // const lead = await prisma.lead.findUnique({
      //   where: { id: Number(req.params.id) },
      //   include: {
      //     groups: true,
      //     campaigns: true
      //   } 
      // })

      if (!lead) {
        throw new HttpError(404, 'Lead not found!')
      }

      res.json(lead)
    } catch (error) {
      next(error);
    }
  }

  update: Handler = async (req, res, next) => {
    try {
      const id = Number(req.params.id)
      const body = UpdateLeadRequestSchema.parse(req.body);

      const leadExist= await this.leadsRepository.findById(id)
      // const leadExist = await prisma.lead.findUnique({ where: { id }})

      if (!leadExist) {
        throw new HttpError(404, 'Lead not found!')
      }

      // verify if lead already was contacted
      if (leadExist.status === "New" && body.status !== "Contacted") {
        throw new HttpError(404, 'A new lead must contacted before changing the status')
      }

      // Validate the inactivity if he it was archived
      if (body.status === "Archived") {
        const now = new Date(); // updated date
        const diffTime = Math.abs(now.getTime() - leadExist.updatedAt.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        // alerting if the lead was archived less than 6 months
        if (diffDays < 180) {
          throw new HttpError(400, "A lead must be archived after 6 months")
        }
      }

      const updatedLead = await this.leadsRepository.updateById(id, body)
      // const updatedLead = await prisma.lead.update({
      //   data: body,
      //   where: { id }
      // })

      res.json(updatedLead)
    } catch (error) {
      next(error);
    }
  }

  delete: Handler = async (req, res, next) => {
    try {
      const id = Number(req.params.id)

      const leadExist = await this.leadsRepository.findById(id)
      // const leadExist = await prisma.lead.findUnique({ where: { id }})

      if (!leadExist) {
        throw new HttpError(404, 'Lead not found!')
      }

      const deletedLead = await this.leadsRepository.deleteById(id)
      // const deletedLead = await prisma.lead.delete({ where: { id }})

      res.json({ deletedLead })
    } catch (error) {
      next(error);
    }
  }
}