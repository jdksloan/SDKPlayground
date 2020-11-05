/**
 *
 *
 * @export
 * @interface IFeedback
 * @template T
 * @template R
 */
export interface IFeedback<T, R = void> {
  handleFeedback(message: T): R;
}
