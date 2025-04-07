const { default: mongoose } = require("mongoose");
const abstractTemplateModel = require("../models/abstractTemplateModel");
const abstractTemplateFieldModel = require("../models/abstractTemplateFieldModel");
const taskListModel = require("../models/taskListModel");

class formService {
  async updateTemplateItems(reqData) {
    try {
      const leaseReportTemplate = await taskListModel.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(reqData.companyId),
            active: true,
            BBForms_AbsData_id: { $exists: true, $ne: null },
            ...(reqData.fromDate && reqData.toDate
              ? {
                  createdAt: {
                    $gte: new Date(reqData.fromDate),
                    $lte: new Date(reqData.toDate),
                  },
                }
              : {}),
            ...(reqData.processId && reqData.processId.length > 0
              ? Array.isArray(reqData.processId)
                ? {
                    processId: { $in: reqData.processId.map((id) => new mongoose.Types.ObjectId(id)) },
                  }
                : {
                    processId: new mongoose.Types.ObjectId(reqData.processId),
                  }
              : {}),
            ...(reqData.propertyId && reqData.propertyId.length > 0
              ? Array.isArray(reqData.propertyId)
                ? {
                    propertyId: { $in: reqData.propertyId.map((id) => new mongoose.Types.ObjectId(id)) },
                  }
                : {
                    propertyId: new mongoose.Types.ObjectId(reqData.propertyId),
                  }
              : {}),
            ...(reqData.tenantId && reqData.tenantId.length > 0
              ? Array.isArray(reqData.tenantId)
                ? {
                    tenantId: { $in: reqData.tenantId.map((id) => new mongoose.Types.ObjectId(id)) },
                  }
                : {
                    tenantId: new mongoose.Types.ObjectId(reqData.tenantId),
                  }
              : {}),
            ...(reqData.tasklistId && reqData.tasklistId.length > 0
              ? Array.isArray(reqData.tasklistId)
                ? {
                    _id: { $in: reqData.tasklistId.map((id) => new mongoose.Types.ObjectId(id)) },
                  }
                : {
                    _id: new mongoose.Types.ObjectId(reqData.tasklistId),
                  }
              : {}),
          },
        },
        {
          $project: {
            _id: 0,
            templateId: "$BBForms_AbsData_id",
          },
        },
      ]);

      if (leaseReportTemplate && reqData.type) {
        const templates = leaseReportTemplate.filter((template) => template.templateId);
        var count = 0;
        for (let temp of templates) {
          const documents = await abstractTemplateModel.findById({ _id: new mongoose.Types.ObjectId(temp.templateId) });
          if (documents) {
            let data = JSON.parse(JSON.stringify(documents));
            let tempResult = { isUpdated: false, tempComp: data.components };
            if (reqData.type === "BGOBASERENTTABLE") {
              tempResult = this.updateBGOBaseRentTable(data.components);
            } else if (reqData.type === "SRPOPTIONSBASETABLE") {
              tempResult = this.updateSRPOptionsRentTable(data.components);
            } else if (reqData.type === "SRPEXPRECINSEXP") {
              tempResult = this.updateSRPExpRecInsExp(data.components);
            } else if (reqData.type === "BGOTABCONVENANTS") {
              tempResult = this.updateBGOTabConvenants(data.components);
            } else if (reqData.type === "TANGERTEMPLATE") {
              tempResult = this.updateTangertemplate(data.components);
            } else if (reqData.type === "TANGERTEMPLATE2") {
              tempResult = this.updateTangertemplate2(data.components);
            } else if (reqData.type === "TANGERTEMPLATE2") {
              tempResult = this.updateTangerOutlets(data.components);
            } else if (reqData.type === "BGOREMOVEFIELDSNONLEASEDATA") {
              tempResult = this.updateBGORemoveNonLeaseData(data.components);
            } else if (reqData.type === "TANGEROUTLETSADDINCOMECATEGORY") {
              tempResult = this.updateTangerOutletsIncomeCategory(data.components);
            } else if (reqData.type === "BGOBASERENTTABLEANDBGOTABCONVENANTS") {
              tempResult = this.updateBGOBaseRentTableAndConvenantsTab(data.components);
            } else if (reqData.type === "PREPINCOMECATEGORY") {
              tempResult = this.updatePrepIncomeCategory(data.components);
            } else if (reqData.type === "BERKLEYINCOMECATEGORY") {
              tempResult = this.updateBerkleyIncomeCategory(data.components);
            } else if (reqData.type === "SHOPCOREINCOMECATEGORY") {
              tempResult = this.updateShopIncomeCategory(data.components);
            }
            count = count + 1;
            console.log("count", count);
            if (tempResult.isUpdated) {
              data.components = tempResult.tempComp;
              await abstractTemplateModel.updateOne(
                { _id: new mongoose.Types.ObjectId(temp.templateId) },
                {
                  $set: {
                    components: data.components,
                    updatedAt: new Date(),
                  },
                }
              );
              let fields = this.loadTemplateFields(data.components);
              if (data.templateFieldsId) {
                await abstractTemplateFieldModel.updateOne(
                  { _id: new mongoose.Types.ObjectId(data.templateFieldsId) },
                  {
                    $set: {
                      fields: fields,
                      updatedAt: new Date(),
                    },
                  }
                );
              } else {
                let insert_data = {};
                insert_data.fields = fields;
                insert_data.createdAt = new Date();
                insert_data.updatedAt = new Date();
                insert_data.active = true;
                const new_data = new abstractTemplateFieldModel(insert_data);
                let doc = await new_data.save();
                if (doc) {
                  await abstractTemplateModel.updateOne(
                    { _id: new mongoose.Types.ObjectId(temp.templateId) },
                    {
                      $set: {
                        templateFieldsId: new mongoose.Types.ObjectId(doc._id),
                        updatedAt: new Date(),
                      },
                    }
                  );
                }
              }
            }
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }

  async updateTemplateFieldItems(reqData) {
    try {
      const leaseReportTemplate = await taskListModel.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(reqData.companyId),
            active: true,
            BBForms_AbsData_id: { $exists: true, $ne: null },
            ...(reqData.fromDate && reqData.toDate
              ? {
                  createdAt: {
                    $gte: new Date(reqData.fromDate),
                    $lte: new Date(reqData.toDate),
                  },
                }
              : {}),
            ...(reqData.processId && reqData.processId.length > 0
              ? Array.isArray(reqData.processId)
                ? {
                    processId: { $in: reqData.processId.map((id) => new mongoose.Types.ObjectId(id)) },
                  }
                : {
                    processId: new mongoose.Types.ObjectId(reqData.processId),
                  }
              : {}),
            ...(reqData.propertyId && reqData.propertyId.length > 0
              ? Array.isArray(reqData.propertyId)
                ? {
                    propertyId: { $in: reqData.propertyId.map((id) => new mongoose.Types.ObjectId(id)) },
                  }
                : {
                    propertyId: new mongoose.Types.ObjectId(reqData.propertyId),
                  }
              : {}),
            ...(reqData.tenantId && reqData.tenantId.length > 0
              ? Array.isArray(reqData.tenantId)
                ? {
                    tenantId: { $in: reqData.tenantId.map((id) => new mongoose.Types.ObjectId(id)) },
                  }
                : {
                    tenantId: new mongoose.Types.ObjectId(reqData.tenantId),
                  }
              : {}),
            ...(reqData.tasklistId && reqData.tasklistId.length > 0
              ? Array.isArray(reqData.tasklistId)
                ? {
                    _id: { $in: reqData.tasklistId.map((id) => new mongoose.Types.ObjectId(id)) },
                  }
                : {
                    _id: new mongoose.Types.ObjectId(reqData.tasklistId),
                  }
              : {}),
          },
        },
        {
          $project: {
            _id: 0,
            templateId: "$BBForms_AbsData_id",
          },
        },
      ]);

      if (leaseReportTemplate && reqData.type) {
        const templates = leaseReportTemplate.filter((template) => template.templateId);
        var count = 0;
        for (let temp of templates) {
          const documents = await abstractTemplateModel.findById({ _id: new mongoose.Types.ObjectId(temp.templateId) });
          if (documents) {
            let data = JSON.parse(JSON.stringify(documents));
            count = count + 1;
            console.log("count", count);
            console.log("TemplateId", temp.templateId);
            let fields = this.loadTemplateFields(data.components);
            if (data.templateFieldsId) {
              await abstractTemplateFieldModel.updateOne(
                { _id: new mongoose.Types.ObjectId(data.templateFieldsId) },
                {
                  $set: {
                    fields: fields,
                    updatedAt: new Date(),
                  },
                }
              );
            } else {
              let insert_data = {};
              insert_data.fields = fields;
              insert_data.createdAt = new Date();
              insert_data.updatedAt = new Date();
              insert_data.active = true;
              const new_data = new abstractTemplateFieldModel(insert_data);
              let doc = await new_data.save();
              if (doc) {
                await abstractTemplateModel.updateOne(
                  { _id: new mongoose.Types.ObjectId(temp.templateId) },
                  {
                    $set: {
                      templateFieldsId: new mongoose.Types.ObjectId(doc._id),
                      updatedAt: new Date(),
                    },
                  }
                );
              }
            }
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }

  updateBGOBaseRentTableAndConvenantsTab(tempComp) {
    let isUpdated = false;
    const incomeCategoryHeader = {
      components: [
        {
          label: "Income Category",
          content: "Income Category",
          key: "incomeCategoryHeader",
          type: "htmlelement",
          uniqueKey: Math.random().toString(36).substring(2, 8),
        },
      ],
    };

    const incomeCategoryField = {
      label: "Income Category",
      data: {
        values: [
          {
            label: "ABTE",
            value: "abte",
          },
          {
            label: "ADM1",
            value: "adm1",
          },
          {
            label: "ADMI",
            value: "admi",
          },
          {
            label: "ADMISL",
            value: "admisl",
          },
          {
            label: "AGIADJ",
            value: "agiadj",
          },
          {
            label: "CAMREC",
            value: "camrec",
          },
          {
            label: "CAMTAXD",
            value: "camtaxd",
          },
          {
            label: "ELEC",
            value: "elec",
          },
          {
            label: "FCOP",
            value: "fcop",
          },
          {
            label: "FRAR",
            value: "frar",
          },
          {
            label: "FREECOMM",
            value: "freecomm",
          },
          {
            label: "FRNT",
            value: "frnt",
          },
          {
            label: "FSTL",
            value: "fstl",
          },
          {
            label: "HVAC",
            value: "hvac",
          },
          {
            label: "JANS",
            value: "jans",
          },
          {
            label: "METR",
            value: "metr",
          },
          {
            label: "MGMT",
            value: "mgmt",
          },
          {
            label: "MGMTSL",
            value: "mgmtsl",
          },
          {
            label: "MMTR",
            value: "mmtr",
          },
          {
            label: "OBAR",
            value: "obar",
          },
          {
            label: "OPEX",
            value: "opex",
          },
          {
            label: "OPEXSL",
            value: "opexsl",
          },
          {
            label: "OPX1",
            value: "opx1",
          },
          {
            label: "OPX2",
            value: "opx2",
          },
          {
            label: "RFRT",
            value: "rfrt",
          },
          {
            label: "RCONDEV",
            value: "rcondev",
          },
          {
            label: "OINL",
            value: "oinl",
          },
          {
            label: "OKIO",
            value: "okio",
          },
          {
            label: "PADM",
            value: "padm",
          },
          {
            label: "PFCO",
            value: "pfco",
          },
          {
            label: "POPX",
            value: "popx",
          },
          {
            label: "PPTX",
            value: "pptx",
          },
          {
            label: "PTAX",
            value: "ptax",
          },
          {
            label: "PTAXSL",
            value: "ptaxsl",
          },
          {
            label: "PTX1",
            value: "ptx1",
          },
          {
            label: "PTX6",
            value: "ptx6",
          },
          {
            label: "PUTI",
            value: "puti",
          },
          {
            label: "PYMF",
            value: "pymf",
          },
          {
            label: "PYRECOV",
            value: "pyrecov",
          },
          {
            label: "RFRT",
            value: "rfrt",
          },
          {
            label: "RNTE",
            value: "rnte",
          },
          {
            label: "RNTF",
            value: "rntf",
          },
          {
            label: "RNTG",
            value: "rntg",
          },
          {
            label: "RNTI",
            value: "rnti",
          },
          {
            label: "RNTL",
            value: "rntl",
          },
          {
            label: "RNTNORR",
            value: "rntnorr",
          },
          {
            label: "RNTO",
            value: "rnto",
          },
          {
            label: "RNTOSL",
            value: "rntosl",
          },
          {
            label: "RNTP",
            value: "rntp",
          },
          {
            label: "RNTR",
            value: "rntr",
          },
          {
            label: "ROFFICE",
            value: "roffice",
          },
          {
            label: "RTPY",
            value: "rtpy",
          },
          {
            label: "RGOF",
            value: "rgof",
          },
          {
            label: "RGRT",
            value: "rgrt",
          },
          {
            label: "RINL",
            value: "rinl",
          },
          {
            label: "RNT",
            value: "rnt",
          },
          {
            label: "RNTA",
            value: "rnta",
          },
          {
            label: "RNTC",
            value: "rntc",
          },
          {
            label: "RNTCONFM",
            value: "rntconfm",
          },
          {
            label: "RNTCONLT",
            value: "rntconlt",
          },
          {
            label: "RNTCONR",
            value: "rntconr",
          },
          {
            label: "RFOF",
            value: "rfof",
          },
          {
            label: "STEA",
            value: "stea",
          },
        ],
      },
      key: "incomeCategory",
      properties: {
        a: "Income Category",
      },
      type: "select",
    };
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "Rent/Renewals") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Base Rent" || panel.title === "Base Rent")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table") {
                      item.label = "Base Rent";
                      item.rows.forEach((row, rowIdx) => {
                        if (rowIdx > 0) {
                          row.forEach((col, colIdx) => {
                            col.components.forEach((colItem, compIdx) => {
                              isUpdated = true;
                              colItem.label = item.rows[0][colIdx].components[compIdx].label;
                            });
                          });
                        }
                      });
                    }
                    if (item.type === "table") {
                      isUpdated = true;
                      item.label = "Base Rent";
                      item.rows[0].unshift(incomeCategoryHeader);
                      item.rows.forEach((row, rowIdx) => {
                        isUpdated = true;
                        if (rowIdx > 0) {
                          item.rows[rowIdx].unshift(incomeCategoryField);
                        }
                      });
                    }
                  });
                }
                if (panel.type === "panel" && (panel.label === "Renewal Options" || panel.title === "Renewal Options")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table") {
                      item.label = "Renewal Rent";
                      item.rows.forEach((row, rowIdx) => {
                        if (rowIdx > 0) {
                          row.forEach((col, colIdx) => {
                            col.components.forEach((colItem, compIdx) => {
                              isUpdated = true;
                              colItem.label = item.rows[0][colIdx].components[compIdx].label;
                            });
                          });
                        }
                      });
                    }
                    if (item.type === "table") {
                      isUpdated = true;
                      item.label = "Renewal Rent";
                      item.rows[0].unshift(incomeCategoryHeader);
                      item.rows.forEach((row, rowIdx) => {
                        isUpdated = true;
                        if (rowIdx > 0) {
                          item.rows[rowIdx].unshift(incomeCategoryField);
                        }
                      });
                    }
                  });
                }
              });
            }
            if (tab.label === "Convenants") {
              isUpdated = true;
              tab.label = "Covenants";
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updateBGOBaseRentTable(tempComp) {
    let isUpdated = false;
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "Rent/Renewals") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Base Rent" || panel.title === "Base Rent")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table") {
                      item.label = "Base Rent";
                      item.rows.forEach((row, rowIdx) => {
                        if (rowIdx > 0) {
                          row.forEach((col, colIdx) => {
                            col.components.forEach((colItem, compIdx) => {
                              isUpdated = true;
                              colItem.label = item.rows[0][colIdx].components[compIdx].label;
                            });
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updateTangerOutletsIncomeCategory(tempComp) {
    let isUpdated = false;
    // New Income Category for the first row
    const incomeCategoryHeader = {
      components: [
        {
          label: "Income Category",
          content: "Income Category",
          key: "incomeCategoryHeader",
          type: "htmlelement",
          uniqueKey: Math.random().toString(36).substring(2, 8),
        },
      ],
    };

    const incomeCategoryField = {
      components: [
        {
          label: "Income Category",
          data: {
            values: [
              { label: "ABT", value: "ABT" },
              { label: "ADV", value: "ADV" },
              { label: "CAM", value: "CAM" },
              { label: "FCC", value: "FCC" },
              { label: "FXC", value: "FXC" },
              { label: "GAS", value: "GAS" },
              { label: "INS", value: "INS" },
              { label: "OVR", value: "OVR" },
              { label: "POS", value: "POS" },
              { label: "RNT", value: "RNT" },
              { label: "RTX", value: "RTX" },
              { label: "SNO", value: "SNO" },
              { label: "SPR", value: "SPR" },
              { label: "TAX", value: "TAX" },
              { label: "WTR", value: "WTR" },
              { label: "FTI", value: "FTI" },
              { label: "FTP", value: "FTP" },
              { label: "OBR", value: "OBR" },
              { label: "OFC", value: "OFC" },
              { label: "OTX", value: "OTX" },
              { label: "POP", value: "POP" },
              { label: "PPR", value: "PPR" },
              { label: "SLR", value: "SLR" },
              { label: "SLP", value: "SLP" },
              { label: "SOR", value: "SOR" },
              { label: "SOP", value: "SOP" },
              { label: "APY", value: "APY" },
              { label: "CPY", value: "CPY" },
              { label: "IPY", value: "IPY" },
              { label: "PPY", value: "PPY" },
              { label: "RPY", value: "RPY" },
              { label: "TPY", value: "TPY" },
              { label: "VPY", value: "VPY" },
              { label: "WPY", value: "WPY" },
            ],
          },
          key: "incomeCategory",
          properties: {
            aliasName: "Income Category Base Rent",
          },
          type: "select",
          uniqueKey: Math.random().toString(36).substring(2, 8),
        },
      ],
    };
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "Charge Schedules") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Base Rent" || panel.title === "Base Rent")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table" && item.label === "Base Rent") {
                      isUpdated = true;
                      item.rows[0].unshift(incomeCategoryHeader);
                      item.rows.forEach((row, rowIdx) => {
                        isUpdated = true;
                        if (rowIdx > 0) {
                          item.rows[rowIdx].unshift(incomeCategoryField);
                        }
                      });
                    }
                  });
                } else if (panel.type === "panel" && (panel.label === "CAM/Operating Expenses" || panel.title === "CAM/Operating Expenses")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table" && item.label === "CAM") {
                      isUpdated = true;
                      item.rows[0].unshift(incomeCategoryHeader);
                      item.rows.forEach((row, rowIdx) => {
                        isUpdated = true;
                        if (rowIdx > 0) {
                          item.rows[rowIdx].unshift(incomeCategoryField);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updatePrepIncomeCategory(tempComp) {
    let isUpdated = false;
    // New Income Category for the first row
    const incomeCategoryHeader = {
      components: [
        {
          label: "Income Category",
          content: "Income Category",
          key: "incomeCategoryHeader",
          type: "htmlelement",
          uniqueKey: Math.random().toString(36).substring(2, 8),
        },
      ],
    };

    const incomeCategoryField = {
      components: [
        {
          label: "Income Category",
          data: {
            values: [
              {
                label: "RNT",
                value: "rnt",
              },
              {
                label: "ABA",
                value: "aba",
              },
              {
                label: "XXX",
                value: "xxx",
              },
              {
                label: "ZZZ",
                value: "zzz",
              },
              {
                label: "FCM",
                value: "fcm",
              },
              {
                label: "CMN",
                value: "cmn",
              },
              {
                label: "PTX",
                value: "ptx",
              },
              {
                label: "INS",
                value: "ins",
              },
              {
                label: "HLD",
                value: "hld",
              },
            ],
          },
          key: "incomeCategory",
          properties: {
            aliasName: "Income Category Base Rent",
          },
          type: "select",
        },
      ],
    };
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "Billing") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Base Rent" || panel.title === "Base Rent")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table" && item.label === "Base Rent") {
                      isUpdated = true;
                      item.rows[0].unshift(incomeCategoryHeader);
                      item.rows.forEach((row, rowIdx) => {
                        isUpdated = true;
                        if (rowIdx > 0) {
                          item.rows[rowIdx].unshift(incomeCategoryField);
                        }
                      });
                    }
                  });
                }
              });
            } else if (tab.label === "Categories/Dates") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Lease Options" || panel.title === "Lease Options")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table" && item.label === "Lease Options") {
                      isUpdated = true;
                      item.rows[0].unshift(incomeCategoryHeader);
                      item.rows.forEach((row, rowIdx) => {
                        isUpdated = true;
                        if (rowIdx > 0) {
                          item.rows[rowIdx].unshift(incomeCategoryField);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updateBerkleyIncomeCategory(tempComp) {
    let isUpdated = false;
    // New Income Category for the first row
    const incomeCategoryHeader = {
      components: [
        {
          label: "Income Category",
          content: "Income Category",
          key: "incomeCategoryHeader",
          type: "htmlelement",
          uniqueKey: Math.random().toString(36).substring(2, 8),
        },
      ],
    };

    const incomeCategoryField = {
      components: [
        {
          label: "Income Category",
          hideLabel: true,
          data: {
            values: [
              {
                label: "9signage",
                value: "9Signage",
              },
              {
                label: "adm",
                value: "adm",
              },
              {
                label: "brn",
                value: "brn",
              },
              {
                label: "caest",
                value: "caest",
              },
              {
                label: "camwuest",
                value: "camwuest",
              },
              {
                label: "Ccon",
                value: "ccon",
              },
              {
                label: "Cfrn",
                value: "cfrn",
              },
              {
                label: "CON",
                value: "con",
              },
              {
                label: "defrent",
                value: "defrent",
              },
              {
                label: "elec",
                value: "elec",
              },
              {
                label: "frn",
                value: "frn",
              },
              {
                label: "gas",
                value: "gas",
              },
              {
                label: "hold",
                value: "hold",
              },
              {
                label: "ins",
                value: "ins",
              },
              {
                label: "mis",
                value: "mis",
              },
              {
                label: "oewotest",
                value: "oewotest",
              },
              {
                label: "opexest",
                value: "opexest",
              },
              {
                label: "park",
                value: "park",
              },
              {
                label: "prn",
                value: "prn",
              },
              {
                label: "ptx",
                value: "ptx",
              },
              {
                label: "utl",
                value: "utl",
              },
              {
                label: "was",
                value: "was",
              },
            ],
          },
          key: "frequency1",
          properties: {
            aliasName: "Income Category Base Rent",
          },
          type: "select",
        },
      ],
    };
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "Charge Schedules") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Recurring Charges" || panel.title === "Recurring Charges")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table" && item.label === "Base Rent") {
                      isUpdated = true;
                      item.rows[0].unshift(incomeCategoryHeader);
                      item.rows[0].pop();
                      item.rows.forEach((row, rowIdx) => {
                        isUpdated = true;
                        if (rowIdx > 0) {
                          item.rows[rowIdx].unshift(incomeCategoryField);
                          item.rows[rowIdx].pop();
                        }
                      });
                    } else if (item.type === "table" && (item.label === "Free Rent/Abatement" || item.label === "Free Rent")) {
                      isUpdated = true;
                      item.rows[0].unshift(incomeCategoryHeader);
                      item.rows[0].pop();
                      item.rows.forEach((row, rowIdx) => {
                        isUpdated = true;
                        if (rowIdx > 0) {
                          item.rows[rowIdx].unshift(incomeCategoryField);
                          item.rows[rowIdx].pop();
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updateShopIncomeCategory(tempComp) {
    let isUpdated = false;
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            // if (tab.label === "General Information") {
            //   tab.components.forEach((panel) => {
            //     if (panel.type === "panel" && (panel.label === "Tenant Information" || panel.title === "Tenant Information")) {
            //       panel.components.forEach((item) => {
            //         if (item.type === "container" && item.label === "Tenant Information") {
            //           item.components.forEach((colItem, compIdx) => {
            //             if (colItem.type === "select" && colItem.label === "Store Category") {
            //               isUpdated = true;
            //               const isTempAvailable = colItem.data.values.some((value) => value.value === "temp");
            //               if (!isTempAvailable) {
            //                 colItem.data.values.push({
            //                   label: "TEMP",
            //                   value: "temp",
            //                 });
            //               }
            //             }
            //           });
            //         } else if (item.type === "select" && item.label === "Store Category") {
            //           isUpdated = true;
            //           const isTempAvailable = item.data.values.some((value) => value.value === "temp");
            //           if (!isTempAvailable) {
            //             item.data.values.push({
            //               label: "TEMP",
            //               value: "temp",
            //             });
            //           }
            //         }
            //       });
            //     }
            //   });
            // }
            if (tab.label === "Charge schedules") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Rent Schedule" || panel.title === "Rent Schedule")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table" && item.label === "Rent Schedule") {
                      item.rows.forEach((row, rowIdx) => {
                        if (rowIdx > 0) {
                          row.forEach((col, colIdx) => {
                            col.components.forEach((colItem, compIdx) => {
                              if (colItem.type === "select" && colItem.label === "Income Category") {
                                isUpdated = true;
                                const isTempAvailable = colItem.data.values.some((value) => value.value === "hva");
                                if (!isTempAvailable) {
                                  colItem.data.values.push(
                                    {
                                      "label": "HVA",
                                      "value": "hva"
                                    }
                                  );
                                }
                              }
                            });
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updateBGORemoveNonLeaseData(tempComp) {
    let isUpdated = false;
    const labelsToRemove = ["Abstracted Date", "Property ID", "Property Name", "Suite ID", "Floor Number", "Area of Premises"];
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "Basic Info") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "NON LEASE DATA" || panel.title === "NON LEASE DATA")) {
                  panel.components = panel.components.filter((component) => !labelsToRemove.includes(component.label));
                  isUpdated = true;
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updateSRPOptionsRentTable(tempComp) {
    let isUpdated = false;
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "Options") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Renewal Option" || panel.title === "Renewal Option")) {
                  panel.components.forEach((item) => {
                    if (item.type === "table" && item.label === "Rent Table") {
                      item.rows.forEach((row, rowIdx) => {
                        if (rowIdx > 0) {
                          row.forEach((col, colIdx) => {
                            col.components.forEach((colItem, compIdx) => {
                              if (colItem.type === "currency") {
                                isUpdated = true;
                                colItem.type = "textfield";
                              }
                            });
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updateSRPExpRecInsExp(tempComp) {
    let isUpdated = false;
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "Charge Schedules") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Expense Recoveries - Insurance" || panel.title === "Expense Recoveries - Insurance")) {
                  panel.components.forEach((item) => {
                    if (item.type === "container" && item.label === "Expense Recoveries - Insurance") {
                      isUpdated = true;
                      item.components.push({
                        columns: [],
                        data: [],
                        defaultValue: null,
                        hideLabel: false,
                        isSilent: true,
                        key: "estimate1",
                        label: "Estimate",
                        rows: [],
                        type: "textfield",
                        uniqueKey: Math.random().toString(36).substring(2, 8),
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updateTangertemplate(tempComp) {
    let isUpdated = false;
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "General Information") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Tenant Space Information" || panel.title === "Tenant Space Information")) {
                  panel.components.forEach((item) => {
                    if (item.type === "number" && item.label === "Square Footage") {
                      isUpdated = true;
                      item.type = "textfield";
                    }
                  });
                }
              });
            }
            if (tab.label === "Lease Clauses") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Restrictions on Tenant’s Use" || panel.title === "Restrictions on Tenant’s Use")) {
                  panel.components.forEach((item) => {
                    if (item.type === "select" && item.label === "Restrictions Present") {
                      isUpdated = true;
                      item.data = {
                        values: [
                          {
                            label: "Yes",
                            value: "Yes",
                          },
                          {
                            label: "No",
                            value: "No",
                          },
                        ],
                      };
                    }
                  });
                }
                if (panel.type === "panel" && (panel.label === "Tenant’s Required Insurance" || panel.title === "Tenant’s Required Insurance")) {
                  panel.components.forEach((item) => {
                    if (item.type === "container" && item.label === "Property Insurance") {
                      isUpdated = true;
                      item.components.push({
                        label: "If not, explain",
                        applyMaskOn: "change",
                        autoExpand: false,
                        tableView: true,
                        key: "ifNotExplain",
                        properties: {
                          aliasName: "If not full replacement",
                        },
                        type: "textarea",
                        input: true,
                      });
                    }
                    if (item.type === "container" && item.label === "Additional Required Coverage") {
                      isUpdated = true;
                      item.label = "Additional Notes";
                    }
                  });
                }
              });
            }
            if (tab.label === "Contact Information") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Tenant Contact Information" || panel.title === "Tenant Contact Information")) {
                  isUpdated = true;
                  panel = this.insertNameAndAttentionFields(panel);
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  insertNameAndAttentionFields(json) {
    const nameField = {
      label: "Name",
      applyMaskOn: "change",
      tableView: true,
      key: "name",
      properties: {
        aliasName: "Tenant Contact Name",
      },
      type: "textfield",
      input: true,
    };

    const attentionField = {
      label: "Attention",
      applyMaskOn: "change",
      tableView: true,
      key: "attention",
      properties: {
        aliasName: "Tenant Contact Attention",
      },
      type: "textfield",
      input: true,
    };
    // Find the index of the Address field
    const addressIndex = json.components.findIndex((component) => component.label === "Address");

    // Check if the Address field exists
    if (addressIndex !== -1) {
      // Insert Name and Attention fields before the Address field
      json.components.splice(addressIndex, 0, nameField, attentionField);
    }

    return json; // Return the modified JSON
  }

  updateTangertemplate2(tempComp) {
    let isUpdated = false;
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "General Information") {
              const componentLabel = ["Delivery Date", "Outside Date", "Late Delivery", "Fixture Period"];
              // let fromPanel = tab.components.find(
              //   (panel) => panel.type === "panel" && (panel.label === "Lease Information" || panel.title === "Lease Information")
              // );
              // let toPanel = tab.components.find(
              //   (panel) => panel.type === "panel" && (panel.label === "Tenant Space Information" || panel.title === "Tenant Space Information")
              // );
              // shiftLeaseInfoFieldToTenantSpaceInfo(fromPanel, toPanel, componentLabel);
              let componentsToMove = [];
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Lease Information" || panel.title === "Lease Information")) {
                  isUpdated = true;
                  componentsToMove = panel.components.filter((component) => componentLabel.includes(component.label));
                  panel.components = panel.components.filter((component) => !componentLabel.includes(component.label));
                }
                if (panel.type === "panel" && (panel.label === "Tenant Space Information" || panel.title === "Tenant Space Information")) {
                  isUpdated = true;
                  panel.components.push(...componentsToMove);
                }
              });
            }
            if (tab.label === "Charge Schedules") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Percentage Rent" || panel.title === "Percentage Rent")) {
                  isUpdated = true;
                  panel = this.insertPRSelectAndLeaseYearPeriodFields(panel);
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  updateTangerOutlets(tempComp) {
    let isUpdated = false;
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "General Information") {
              const componentLabel = ["Delivery Date", "Outside Date", "Late Delivery", "Fixture Period"];
              // let fromPanel = tab.components.find(
              //   (panel) => panel.type === "panel" && (panel.label === "Lease Information" || panel.title === "Lease Information")
              // );
              // let toPanel = tab.components.find(
              //   (panel) => panel.type === "panel" && (panel.label === "Tenant Space Information" || panel.title === "Tenant Space Information")
              // );
              // shiftLeaseInfoFieldToTenantSpaceInfo(fromPanel, toPanel, componentLabel);
              let componentsToMove = [];
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Lease Information" || panel.title === "Lease Information")) {
                  isUpdated = true;
                  componentsToMove = panel.components.filter((component) => componentLabel.includes(component.label));
                  panel.components = panel.components.filter((component) => !componentLabel.includes(component.label));
                }
                if (panel.type === "panel" && (panel.label === "Tenant Space Information" || panel.title === "Tenant Space Information")) {
                  isUpdated = true;
                  panel.components.push(...componentsToMove);
                }
              });
            }
            if (tab.label === "Charge Schedules") {
              tab.components.forEach((panel) => {
                if (panel.type === "panel" && (panel.label === "Percentage Rent" || panel.title === "Percentage Rent")) {
                  isUpdated = true;
                  panel = this.insertPRSelectAndLeaseYearPeriodFields(panel);
                }
              });
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  // shiftLeaseInfoFieldToTenantSpaceInfo(fromPanel, toPanel, componentLabel) {
  //   const componentsToMove = fromPanel.components.filter((component) => componentLabel.includes(component.label));

  //   // Remove components from the original panel
  //   fromPanel.components = fromPanel.components.filter((component) => !componentLabel.includes(component.label));

  //   // Add the components to the target panel
  //   toPanel.components.push(...componentsToMove);
  // }

  insertPRSelectAndLeaseYearPeriodFields(json) {
    const nameField = {
      label: "Percentage Rent is based on Lease Year/Calendar Year",
      widget: "choicesjs",
      tableView: true,
      data: {
        values: [
          {
            label: "Lease Year",
            value: "Lease Year",
          },
          {
            label: "Calendar Year",
            value: "Calendar Year",
          },
        ],
      },
      key: "percentageRentIsBasedOnLeaseYearCalendarYear",
      type: "select",
      input: true,
    };

    const attentionField = {
      label: "Lease Year Period",
      applyMaskOn: "change",
      autoExpand: false,
      tableView: true,
      key: "leaseYearPeriod",
      type: "textarea",
      input: true,
    };
    // Find the index of the Address field
    const addressIndex = json.components.findIndex((component) => component.label === "Percentage Rent" && component.type === "container");

    // Check if the Address field exists
    if (addressIndex !== -1) {
      // Insert Name and Attention fields before the Address field
      json.components.splice(addressIndex, 0, nameField, attentionField);
    }

    return json; // Return the modified JSON
  }

  updateBGOTabConvenants(tempComp) {
    let isUpdated = false;
    try {
      tempComp.forEach((comp) => {
        if (comp.type === "tabs") {
          comp.components.forEach((tab) => {
            if (tab.label === "Convenants") {
              isUpdated = true;
              tab.label = "Covenants";
            }
          });
        }
      });
      return { isUpdated, tempComp };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  loadTemplateFields(tempComp) {
    let fields = [];
    tempComp &&
      tempComp.forEach((comp, compIndex) => {
        if (comp.type === "tabs") {
          comp.components &&
            comp.components.forEach((tab, tabIndex) => {
              tab.components &&
                tab.components.forEach((panel, panelIndex) => {
                  if (panel.type === "panel" && panel.isDeleted !== true) {
                    panel.components &&
                      panel.components.forEach((item, itemIndex) => {
                        if (item.type === "table" && item.isDeleted !== true) {
                          {
                            item.rows &&
                              item.rows.forEach((row, rowIndex) => {
                                row &&
                                  row.forEach((col, colIndex) => {
                                    col &&
                                      col.components.length &&
                                      col.components.forEach((colItem, index) => {
                                        const firstItem = item.rows[0][colIndex].components[index];
                                        const tableField = {
                                          ...colItem,
                                          label: firstItem.label ? firstItem.label : firstItem.title ? firstItem.title : firstItem.content,
                                        };
                                        const field = this.fieldItems(tableField, tab, panel, item, compIndex, tabIndex, panelIndex, itemIndex, rowIndex, true);
                                        fields.push(field);
                                      });
                                  });
                              });
                          }
                        } else if (item.type === "columns" && item.isDeleted !== true) {
                          {
                            item.columns &&
                              item.columns.forEach((col, colIndex) => {
                                col &&
                                  col.components &&
                                  col.components.length &&
                                  col.components.forEach((colItem, index) => {
                                    const field = this.fieldItems(colItem, tab, panel, item, compIndex, tabIndex, panelIndex, itemIndex, 0, true);
                                    fields.push(field);
                                  });
                              });
                          }
                        } else if (item.type === "container" && item.isDeleted !== true) {
                          {
                            item.components.length &&
                              item.components.forEach((comp, index) => {
                                if (comp.type === "columns") {
                                  {
                                    comp.columns &&
                                      comp.columns.forEach((col, colIndex) => {
                                        col &&
                                          col.components &&
                                          col.components.length &&
                                          col.components.forEach((colItem, index) => {
                                            const field = this.fieldItems(colItem, tab, panel, item, compIndex, tabIndex, panelIndex, itemIndex, 0, true);
                                            fields.push(field);
                                          });
                                      });
                                  }
                                } else {
                                  const field = this.fieldItems(comp, tab, panel, item, compIndex, tabIndex, panelIndex, itemIndex, 0, true);
                                  fields.push(field);
                                }
                              });
                          }
                        } else {
                          const field = this.fieldItems(item, tab, panel, null, compIndex, tabIndex, panelIndex, itemIndex, 0, false);
                          fields.push(field);
                        }
                      });
                  }
                });
            });
        }
      });
    return fields;
  }

  fieldItems(subItem, tab, panel, item, compIndex, tabIndex, panelIndex, itemIndex, rowIndex, isSection) {
    return {
      label: subItem.label,
      type: subItem.type,
      title: subItem.label,
      key: subItem.key,
      defaultValue: subItem.defaultValue,
      content: subItem.content,
      tag: subItem.tag,
      tags: subItem.tags,
      properties: subItem.properties,
      isSilent: subItem.isSilent,
      isDuplicate: subItem.isDuplicate,
      isDeleted: subItem.isDeleted || item?.isDeleted,
      isSection: isSection,
      hideLabel: subItem.hideLabel,
      fileId: subItem.fileId ? subItem.fileId : undefined,
      copied: subItem.copied ? subItem.copied : undefined,
      comments: subItem.comments ? subItem.comments : undefined,
      compIndex: compIndex,
      tabIndex: tabIndex,
      tabName: tab.label,
      panelIndex: panelIndex,
      panelName: panel.title,
      sectionName: item ? item.label : null,
      itemIndex: itemIndex,
      rowIndex: rowIndex ? rowIndex : 0,
      itemId: `item-${subItem.key}`,
    };
  }
}

module.exports = new formService();
