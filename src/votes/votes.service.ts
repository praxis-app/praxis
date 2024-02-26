import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { NotificationType } from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { ProposalsService } from '../proposals/proposals.service';
import { QuestionnaireTicket } from '../questions/models/questionnaire-ticket.model';
import { QuestionsService } from '../questions/questions.service';
import { User } from '../users/models/user.model';
import { CreateVoteInput } from './models/create-vote.input';
import { UpdateVoteInput } from './models/update-vote.input';
import { Vote } from './models/vote.model';
import { VoteTypes } from './votes.constants';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,

    @InjectRepository(QuestionnaireTicket)
    private questionnaireTicketRepository: Repository<QuestionnaireTicket>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private notificationsService: NotificationsService,
    private proposalsService: ProposalsService,
    private questionsService: QuestionsService,
  ) {}

  async getVote(id: number, relations?: string[]) {
    return this.voteRepository.findOneOrFail({ where: { id }, relations });
  }

  async getVotes(where?: FindOptionsWhere<Vote>) {
    return this.voteRepository.find({ where });
  }

  async getQuestionnaireTicket(questionnaireTicketId: number) {
    return this.questionnaireTicketRepository.findOne({
      where: { id: questionnaireTicketId },
    });
  }

  async createVote(voteData: CreateVoteInput, userId: number) {
    const vote = await this.voteRepository.save({
      ...voteData,
      userId,
    });

    if (vote.proposalId) {
      const isProposalRatifiable =
        await this.proposalsService.isProposalRatifiable(vote.proposalId);
      if (isProposalRatifiable) {
        await this.proposalsService.ratifyProposal(vote.proposalId);
        await this.proposalsService.implementProposal(vote.proposalId);
      }

      const proposal = await this.proposalsService.getProposal(vote.proposalId);

      if (vote.userId !== proposal.userId) {
        const voteNotificationType = this.getVoteNotificationType(vote);
        await this.notificationsService.createNotification({
          notificationType: voteNotificationType,
          otherUserId: vote.userId,
          userId: proposal.userId,
          proposalId: proposal.id,
          voteId: vote.id,
        });
      }
    }

    if (vote.questionnaireTicketId) {
      if (vote.voteType === VoteTypes.Block) {
        await this.questionsService.denyQuestionnaireTicket(
          vote.questionnaireTicketId,
        );
      } else {
        const isVerifiable =
          await this.questionsService.isQuestionnaireTicketVerifiable(
            vote.questionnaireTicketId,
          );
        if (isVerifiable) {
          await this.questionsService.approveQuestionnaireTicket(
            vote.questionnaireTicketId,
          );
          await this.questionsService.verifyQuestionnaireTicketUser(
            vote.questionnaireTicketId,
            vote.userId,
          );
        }
      }
      // Notify other users with access that a ticket vote has been cast
      const otherUsersWithAccess = await this.userRepository.find({
        where: {
          id: Not(vote.userId),
          serverRoles: {
            permission: { manageQuestionnaireTickets: true },
          },
        },
      });
      for (const user of otherUsersWithAccess) {
        const notificationType = this.getVoteNotificationType(vote);
        await this.notificationsService.createNotification({
          questionnaireTicketId: vote.questionnaireTicketId,
          otherUserId: vote.userId,
          userId: user.id,
          voteId: vote.id,
          notificationType,
        });
      }
    }

    return { vote };
  }

  getVoteNotificationType({ voteType, questionnaireTicketId }: Vote) {
    if (voteType === VoteTypes.Reservations) {
      if (questionnaireTicketId) {
        return NotificationType.QuestionnaireTicketVoteReservations;
      }
      return NotificationType.ProposalVoteReservations;
    }
    if (voteType === VoteTypes.StandAside) {
      if (questionnaireTicketId) {
        return NotificationType.QuestionnaireTicketVoteStandAside;
      }
      return NotificationType.ProposalVoteStandAside;
    }
    if (voteType === VoteTypes.Block) {
      if (questionnaireTicketId) {
        return NotificationType.QuestionnaireTicketVoteBlock;
      }
      return NotificationType.ProposalVoteBlock;
    }
    if (questionnaireTicketId) {
      return NotificationType.QuestionnaireTicketVoteAgreement;
    }
    return NotificationType.ProposalVoteAgreement;
  }

  async updateVote({ id, ...data }: UpdateVoteInput, userId: number) {
    await this.voteRepository.update(id, data);
    const vote = await this.getVote(id, ['proposal']);

    // Update notification for proposal owner
    if (vote.proposalId) {
      const notification = await this.notificationsService.getNotification({
        otherUserId: userId,
        proposalId: vote.proposalId,
        userId: vote.proposal?.userId,
        voteId: vote.id,
      });
      if (notification) {
        const notificationType = this.getVoteNotificationType(vote);
        await this.notificationsService.updateNotification(notification.id, {
          notificationType,
        });
      }
    }

    // Update notifications for other users with access to the questionnaire ticket
    if (vote.questionnaireTicketId) {
      const notifications = await this.notificationsService.getNotifications({
        questionnaireTicketId: vote.questionnaireTicketId,
        userId: Not(userId),
        otherUserId: userId,
        voteId: vote.id,
      });
      for (const notification of notifications) {
        const notificationType = this.getVoteNotificationType(vote);
        await this.notificationsService.updateNotification(notification.id, {
          notificationType,
        });
      }
    }

    return { vote };
  }

  async deleteVote(voteId: number) {
    await this.voteRepository.delete(voteId);
    return true;
  }
}
