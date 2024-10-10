import { Handler } from "express";
import { prisma } from "../database";
import { CreateGroupRequestSchema, GetGroupRequestSchema, UpdateGroupRequestSchema } from "./schemas/GroupsRequestSchema";
import { HttpError } from "../errors/HttpError";
import { Prisma } from "@prisma/client";

export class GroupsController {
  index: Handler = async (req, res, next) => {
    try {
      const query = GetGroupRequestSchema.parse(req.query);
      const { 
        page = '1',
        pageSize = '10',
        name,
        description, 
        sortBy = "name", 
        order = "asc" 
      } = query

       // convert string to number
       const pageNumber = Number(page)
       const pageSizeNumber = Number(pageSize)

       // type of request input parameters
      const where: Prisma.GroupWhereInput = {}

      // verify if query contains the value
      if (name) where.name = { contains: name, mode: 'insensitive' }
      if (description) where.description = { 
        contains: description, 
        mode: 'insensitive' 
      }
     
      const groups = await prisma.group.findMany({
        where,
        skip: (pageNumber - 1) * pageSizeNumber, // initial = 0
        take: pageSizeNumber,
        orderBy: { [sortBy]: order } // using zod parameters
      })

      const total = await prisma.group.count({ where })  

      res.json({
        data: groups,
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
      const body = CreateGroupRequestSchema.parse(req.body)
      const newGroup = await prisma.group.create({
        data: body
      })

      res.status(201).json(newGroup)
    } catch (error) {
      next(error);
    }
  }

  show: Handler = async (req, res, next) => {
    try {
      const group = await prisma.group.findUnique({
        where: { id: Number(req.params.id) },
        include: { leads: true }
      })

      if (!group) {
        throw new HttpError(404, "Group not found")
      }

      res.json(group)
    } catch (error) {
      next(error);
    }
  }

  update: Handler = async (req, res, next) => {
    try {
      const id = Number(req.params.id)
      const body = UpdateGroupRequestSchema.parse(req.body)

      const groupExists = await prisma.group.findUnique({ where: { id }})
      
      if (!groupExists) {
        throw new HttpError(404, "Group not found!")
      }

      const updatedGroup = await prisma.group.update({
        data: body,
        where: { id }
      })

      res.json(updatedGroup)
    } catch (error) {
      next(error);
    }
  }

  delete: Handler = async (req, res, next) => {
    try {
      const id = Number(req.params.id)

      const groupExists = await prisma.group.findUnique({ where: { id }})
      
      if (!groupExists) {
        throw new HttpError(404, "Group not found!")
      }

      const deletedGroup = await prisma.group.delete({
        where: { id }
      })

      res.json(deletedGroup)
    } catch (error) {
      next(error);
    }
  }
}