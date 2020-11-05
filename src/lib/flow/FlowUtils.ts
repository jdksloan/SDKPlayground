/**
 * Set of utility functions for flow control.
 *
 * @export
 * @class FlowUtils
 */
export class FlowUtils {
  /**
   * Returns a promise tuat resolves after the specified time in milliseconds.
   *
   * @static
   * @param {number} ms The time in miilisseconds to wait until the promise is resolved
   * @returns
   * @memberof FlowUtils
   */
  public static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
