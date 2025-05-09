import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ISendMailOptions } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(
    private configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  private async compileTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate({
      ...data,
      domain: this.configService.get('DOMAIN')
    });
  }

  async sendMail(sendMailOptions: ISendMailOptions) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get("SMTP_FROM_EMAIL"),
        to: Array.isArray(sendMailOptions.to) 
          ? sendMailOptions.to.map(addr => typeof addr === 'string' ? addr : addr.address)
          : [typeof sendMailOptions.to === 'string' ? sendMailOptions.to : sendMailOptions.to.address],
        subject: sendMailOptions.subject,
        html: typeof sendMailOptions.html === 'string' ? sendMailOptions.html : undefined,
        text: typeof sendMailOptions.text === 'string' ? sendMailOptions.text : undefined,
      });

      if (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Email sent successfully',
        data
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send email',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async sendContactForm(data: any) {
    try {
      const html = await this.compileTemplate('contact', data);
      return this.sendMail({
        to: data.email,
        subject: 'New Contact Form Submission',
        html
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send contact form',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async sendOrderCompletion(data: any) {
    try {
      const html = await this.compileTemplate('order-completion', data);
      return this.sendMail({
        to: data.email,
        subject: 'Order Completion Confirmation',
        html
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send order completion email',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
