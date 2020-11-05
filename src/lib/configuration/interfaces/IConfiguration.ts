/**
 * Injection of configuration for the dynamic config loading of a service
 *
 * @export
 * @interface IConfiguration
 */
export interface IConfiguration {
  /**
   * Gets the configuration value based on a name
   *
   * @param {string} configName
   * @memberof IConfiguration
   */
  getValue<T>(configName: string, consumerName?: string): Promise<T>;

  /**
   * Adds a new config
   *
   * @template T
   * @param {string} configName
   * @param {*} value
   * @returns {Promise<T>}
   * @memberof IConfiguration
   */
  upsertValue(configName: string, value: any, serviceName: string): void;

  /**
   * Gets all the configs
   *
   * @returns {Promise<void>}
   * @memberof IConfiguration
   */
  fetch(): Promise<void>;

  /**
   * Get all the pipeline names for the specified configs
   *
   * @param {string[]} configNames
   * @returns {string[]}
   * @memberof IConfiguration
   */
  getConsumerMap(configNames: string[]): string[];
}
