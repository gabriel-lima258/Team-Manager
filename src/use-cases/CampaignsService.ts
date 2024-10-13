import { HttpError } from "../errors/HttpError";
import { CampaignsRepository, CreateCampaignAttributes } from "../repositories/CampaignsRepository";

export class CampaignsService {
  constructor(private readonly campaignsRepository: CampaignsRepository) {}

  async getAllCampaigns() {
    const campaigns = await this.campaignsRepository.find()
    return campaigns
  }

  async createCampaigns(params: CreateCampaignAttributes) {
    const newCampaign = await this.campaignsRepository.create(params)
    return newCampaign
  }

  async getCampaignById(id: number) {
    const campaign = await this.campaignsRepository.findById(id)

    if (!campaign) {
      throw new HttpError(404, "Campaign not found")
    }

    return campaign
  }

  async updateCampaign(campaignId: number, params: Partial<CreateCampaignAttributes>) {
    const updatedCampaign = await this.campaignsRepository.updateById(campaignId, params)

      if (!updatedCampaign) {
        throw new HttpError(404, "Campaign not found!")
      }

    return updatedCampaign
  }

  async deleteCampaign(campaignId: number) {
    const deletedCampaign = await this.campaignsRepository.deleteById(campaignId)
      
    if (!deletedCampaign) {
      throw new HttpError(404, "Campaign not found!")
    }

    return deletedCampaign
  }

}