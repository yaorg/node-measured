/**
 * Validation functions for validating public input
 * @module SignalFxReporterInputValidators
 * @private
 */
module.exports = {
  /**
   * Validates that the object supplied for the sfx client at least has a send function
   * @param signalFxClient
   */
  validateSignalFxClient: signalFxClient => {
    if (signalFxClient === undefined) {
      throw new Error('signalFxClient was undefined when it is required');
    }

    if (typeof signalFxClient.send !== 'function' || signalFxClient.length < 1) {
      throw new Error('signalFxClient must implement send(data: any)');
    }
  }
};
