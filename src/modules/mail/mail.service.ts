import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

import type { SendLinkToResetPassword } from './mail.entity';
import { appName } from 'src/globals/constants';
import { passwordReset } from './templates';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;
  private to: string;
  private subject: string;
  private html: string;

  constructor() {
    this.resend = new Resend(process.env.MAIL_API_KEY);
    this.from = `${appName} <${process.env.MAIL_FROM}>`;
  }

  async sendLinkToResetPassword(props: SendLinkToResetPassword) {
    const { to, recoverLink, userName } = props;

    try {
      this.to = to;
      this.subject = `${userName} recupere seu acesso a ${appName}`;
      this.html = await passwordReset({
        appName,
        recoverLink,
        userName,
      });

      this.sendMail();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error when trying to configure email: [send_link_to_reset_password]',
      );
    }
  }

  private async sendMail() {
    try {
      const response = await this.resend.emails.send({
        from: this.from,
        to: this.to,
        subject: this.subject,
        html: this.html,
      });

      return response;
    } catch (error) {
      throw new InternalServerErrorException('Error when trying to send email');
    }
  }
}
