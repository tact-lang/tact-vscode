/* eslint-disable global-require */
import * as handleContractDefinitionComments from './handleContractDefinitionComments';
import * as handleModifierInvocationComments from './handleModifierInvocationComments';

export default [
  handleContractDefinitionComments,
  handleModifierInvocationComments
];
