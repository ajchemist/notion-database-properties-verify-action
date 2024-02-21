import * as core from '@actions/core'
import { Client } from '@notionhq/client'

interface DatabaseSpec {
  [propertyName: string]: string
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const notionToken = core.getInput('notion_token')
    const databaseId = core.getInput('database_id')
    const expectedSpec: DatabaseSpec = JSON.parse(
      core.getInput('database_spec')
    )

    //
    const notion = new Client({ auth: notionToken })
    const response = await notion.databases.retrieve({
      database_id: databaseId
    })
    const properties = response.properties

    //
    for (const [key, value] of Object.entries(expectedSpec)) {
      if (!properties[key]) {
        throw new Error(`Property ${key} does not exist.`)
      }
      const propertyType = properties[key].type
      if (propertyType !== value) {
        throw new Error(
          `Property ${key} is of type ${propertyType}, expected ${value}.`
        )
      }
    }

    // action outputs
    core.setOutput('validation_success', 'true')
    core.setOutput('failure_reason', '')
    console.log('Validation successful')
  } catch (error: any) {
    core.setFailed(`Action failed with error: ${error.message}`)
    core.setOutput('validation_success', 'false')
    core.setOutput('failure_reason', error)
  }
}
