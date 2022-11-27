export const DatawichClientApis = {
  ModelClientListGet: {
    method: 'GET',
    route: '/api/v2/general-model-client',
    description: 'Model Client List Get',
  },
  ModelClientCreate: {
    method: 'POST',
    route: '/api/v2/general-model-client',
    description: 'Model Client Create',
  },
  ModelClientUpdate: {
    method: 'PUT',
    route: '/api/v2/general-model-client/:appid',
    description: 'Model Client Update',
  },
  ModelClientDelete: {
    method: 'DELETE',
    route: '/api/v2/general-model-client/:appid',
    description: 'Model Client Delete',
  },
  ClientAuthModelListGet: {
    method: 'GET',
    route: '/api/v2/general-model-client/:appid/auth-model',
    description: 'Client Auth Model List Get',
  },
  ClientAuthModelListUpdate: {
    method: 'PUT',
    route: '/api/v2/general-model-client/:appid/auth-model',
    description: 'Client Auth Model List Update',
  },
}
