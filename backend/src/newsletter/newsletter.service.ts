import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './newsletter-subscriber.entity';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly repo: Repository<NewsletterSubscriber>,
  ) {}

  async subscribe(dto: SubscribeDto): Promise<{ message: string }> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('This email is already subscribed.');
      }
      // Re-activate soft-unsubscribed address
      existing.isActive = true;
      await this.repo.save(existing);
      return { message: 'Welcome back! You have been re-subscribed.' };
    }

    const subscriber = this.repo.create(dto);
    await this.repo.save(subscriber);
    return { message: 'Thank you for subscribing!' };
  }

  async unsubscribe(email: string): Promise<{ message: string }> {
    const subscriber = await this.repo.findOne({ where: { email } });
    if (!subscriber) return { message: 'Email not found.' };
    subscriber.isActive = false;
    await this.repo.save(subscriber);
    return { message: 'You have been unsubscribed.' };
  }
}
