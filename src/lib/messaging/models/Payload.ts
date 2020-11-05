import { IRequestContext } from '../../context/interfaces/IRequestContext';

/**
 * The payload model.
 * Used for passing messages to and from the queues
 * In and out of pipelines, standardized data model.
 *
 * @export
 * @class Payload
 */
export class Payload {
  /**
   * This is the data of the payload.
   * This is from the request or of a reponse of a service.
   * When the user makes a request, data is what the user is requesting
   *
   * @type {*}
   * @memberof Payload
   */
  public data: any;

  /**
   * The context is data that is about the request, what time, who made it etc
   *
   * @type {IRequestContext}
   * @memberof Payload
   */
  public context: IRequestContext;

  public routingKey?: string;

  constructor(data: any, context: IRequestContext, routingKey?: string) {
    this.data = data;
    this.context = context;
    this.routingKey = routingKey;
  }
}
