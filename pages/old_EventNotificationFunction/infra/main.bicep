targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Id of the user or app to assign application roles')
param principalId string = ''

@description('Name of the existing Storage Account to use')
param existingStorageAccountName string

@description('Resource group of the existing Storage Account')
param existingStorageAccountResourceGroup string = ''

// Tags that should be applied to all resources.
var tags = {
  'azd-env-name': environmentName
  'app': 'event-notification'
}

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: tags
}

// Deploy the function app and supporting resources
module functionApp './resources.bicep' = {
  name: 'functionapp'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
    principalId: principalId
    tags: tags
    existingStorageAccountName: existingStorageAccountName
    existingStorageAccountResourceGroup: !empty(existingStorageAccountResourceGroup) ? existingStorageAccountResourceGroup : rg.name
  }
}

// Outputs
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name
output AZURE_FUNCTION_APP_NAME string = functionApp.outputs.functionAppName
output AZURE_STORAGE_ACCOUNT_NAME string = functionApp.outputs.storageAccountName
output AZURE_FUNCTION_APP_URL string = functionApp.outputs.functionAppUrl
