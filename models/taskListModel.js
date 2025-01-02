const mongoose = require("mongoose");

const taskListSchema = new mongoose.Schema(
  {
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "realserv_mast_statuses",
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "realserv_mast_properties",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "realserv_company_information",
    },
    processId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "realserv_client_process",
    },
    formList: [
      {
        type: mongoose.Schema.Types.Mixed,
        //    active : {
        //     type : Boolean,
        //     default : true
        //    }
      },
    ],
    BBForms_AbsData_id: {
      type: String,
      required: false,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "realserv_mast_tenants",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "realserv_sub_category",
    },
    processFlow: [
      {
        type: String,
        required: false,
        ref: "realserv_process_flows",
      },
    ],
    propertyManager: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "realserv_property_managers",
      },
    ],
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    comments: [
      {
        remarks: {
          type: String,
          required: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: String,
          required: false,
        },
        usertype: {
          type: String,
          required: false,
        },
        userName: {
          type: String,
          required: false,
        },

        isType : {
          type : Number,
          dafault: 1,
          required : false
        },
        active: {
          type: Boolean,
          required: true,
          default: true,
        },
      },
    ],
    caseNo: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    files: [
      {
        url: {
          type: String,
          required: false,
        },
        name: {
          type: String,
          required: false,
        },
        caseNo: {
          type: String,
          required: false,
        },
        localFilePath: {
          type: String,
          default: null,
          required: false,
        },
        processStatus: {
          type: Number,
          default: null,
          required: false,
        },
        absSearchData: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
          required: false,
        },
        absNERId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
          required: false,
        },
        fileRefName: {
          type: String,
          default: null,
          required: false,
        },
        effectiveDate: {
          type: String,
          default: null,
          required: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "useradmin_mast_user",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isAmended: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    strict: true,
  }
);

const taskList = mongoose.model("realserv_task_list", taskListSchema);

module.exports = taskList;
