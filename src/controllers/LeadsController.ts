import { Handler } from "express";
import { prisma } from "../database";
import { CreateLeadRequestSchema, GetLeadsRequestSchema, UpdateLeadRequestSchema } from "./schemas/LeadsRequestSchema";
import { HttpError } from "../errors/HttpError";
import { Prisma } from "@prisma/client";

export class LeadsController {
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
      const pageNumber = Number(page)
      const pageSizeNumber = Number(pageSize)

      // type of request input parameters
      const where: Prisma.LeadWhereInput = {}

      // verify if query contains the value
      if (name) where.name = { contains: name, mode: 'insensitive' }
      if (status) where.status = status

      const leads = await prisma.lead.findMany({
        where,
        skip: (pageNumber - 1) * pageSizeNumber, // initial = 0
        take: pageSizeNumber,
        orderBy: { [sortBy]: order } // using zod parameters
      })
       
      const total = await prisma.lead.count({ where })

      res.json({
        data: leads,
        meta: {
          page: pageNumber,
          pageSize: pageSizeNumber,
          total,
          totalPages: Math.ceil(total  / pageSizeNumber)
        }
      })
    } catch (error) {
      next(error);
    }
  }

  create: Handler = async (req, res, next) => {
    try {
      const body = CreateLeadRequestSchema.parse(req.body);
      const newLead = await prisma.lead.create({
        data: body
      })

      res.status(201).json(newLead)
    } catch (error) {
      next(error);
    }
  }

  show: Handler = async (req, res, next) => {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: Number(req.params.id) },
        include: {
          groups: true,
          campaigns: true
        } 
      })

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

      const leadExist = await prisma.lead.findUnique({ where: { id }})

      if (!leadExist) {
        throw new HttpError(404, 'Lead not found!')
      }

      const updatedLead = await prisma.lead.update({
        data: body,
        where: { id }
      })

      res.json(updatedLead)
    } catch (error) {
      next(error);
    }
  }

  delete: Handler = async (req, res, next) => {
    try {
      const id = Number(req.params.id)

      const leadExist = await prisma.lead.findUnique({ where: { id }})

      if (!leadExist) {
        throw new HttpError(404, 'Lead not found!')
      }

      const deletedLead = await prisma.lead.delete({ where: { id }})

      res.json({ deletedLead })
    } catch (error) {
      next(error);
    }
  }
}