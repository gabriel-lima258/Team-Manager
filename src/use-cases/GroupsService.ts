import { HttpError } from "../errors/HttpError";
import { CreateGroupAttributes, GroupsRepository } from "../repositories/GroupsRepository";

export class GroupsService {

  constructor(private readonly groupsRepository: GroupsRepository) {}

  async getAllGroups() {
    const groups = await this.groupsRepository.find()
    return groups
  }

  async createGroups(params: CreateGroupAttributes) {
    const newGroup = await this.groupsRepository.create(params)
    return newGroup
  }

  async getGroupById(id: number) {
    const group = await this.groupsRepository.findById(id)

    if (!group) {
      throw new HttpError(404, "Group not found")
    }

    return group
  }

  async updateGroup(groupId: number, params: Partial<CreateGroupAttributes>) {
    const updatedGroup = await this.groupsRepository.updateById(groupId, params)

      if (!updatedGroup) {
        throw new HttpError(404, "Group not found!")
      }

    return updatedGroup
  }

  async deleteGroup(groupId: number) {
    const deletedGroup = await this.groupsRepository.deleteById(groupId)
      
    if (!deletedGroup) {
      throw new HttpError(404, "Group not found!")
    }

    return deletedGroup
  }
}