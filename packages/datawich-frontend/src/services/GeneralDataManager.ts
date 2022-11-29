import Vue from 'vue'
import { FieldTypeDescriptor } from '@fangcha/datawich-service/lib/common/models'
import {
  _DatawichAttachmentOptions,
  AttachmentFieldPlugin,
  AttachmentOptions,
  FieldPluginCenter,
} from '@fangcha/datawich-frontend'
import { AccessLevelDescriptor, describeAccessLevelDetail } from '@web/datawich-common/models'

class _GeneralDataManager {
  public loadVueFilters() {
    Vue.filter('describe_model_field_type', function (val: any) {
      return FieldTypeDescriptor.describe(val)
    })

    Vue.filter('describe_model_access_level', function (val: any) {
      return AccessLevelDescriptor.describe(val)
    })

    Vue.filter('describe_model_access_level_detail', function (val: any) {
      return describeAccessLevelDetail(val)
    })
    Vue.filter(
      'digitFormat',
      function (n: number | string, digits: number = 2, maximumFractionDigits: number | null = null) {
        if (n === '' || n === null || n === undefined) {
          return ''
        }
        if (maximumFractionDigits === null) {
          maximumFractionDigits = digits
        }
        const config =
          digits === 0 && maximumFractionDigits === 0
            ? {}
            : { maximumFractionDigits: maximumFractionDigits, minimumFractionDigits: digits }
        return Number(n).toLocaleString('en-US', config)
      }
    )
  }

  public useAttachmentFieldPlugin(options: AttachmentOptions) {
    Object.assign(_DatawichAttachmentOptions, options)
    FieldPluginCenter.addPlugin(new AttachmentFieldPlugin())
    return this
  }
}

export const GeneralDataManager = new _GeneralDataManager()
