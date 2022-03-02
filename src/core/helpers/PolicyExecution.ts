import _ from "lodash";
import moment from "moment";

class PolicyExecution {
  policyType: any;
  auxiliaryEntity: any;
  contextData: any;
  pRule: any;
  defaultPRule: any;
  sectionPMetadata: any;
  sectionDefaultPRuleMetaData: any;
  formData: any;

  executePolicy = (policy) => {
    const _self = this;
    _self.policyType = policy.type;
    _self.auxiliaryEntity = policy.auxiliaryEntity;
    if (policy.rules) {
      for (let i = 0; i < policy.rules.length; i++) {
        let rule = policy.rules[i];
        if (rule['@type'] === 'rule') {
          if (_self.policyType === 'preCondition') {
            return _self.executeRule(_self.defaultPRule, rule);
          } else if (_self.policyType === 'businessValidation') {
            if (!_self.executeRule(_self.defaultPRule, rule)) {
              return rule.failure.message;
            }
          } else {
            let condition = _self.executeRule(_self.defaultPRule, rule, policy.attrType);
            if (condition) {
              break;
            }
          }
        }
      }
    }
  };

  executeRule = (defaultPRule, rule, attrType?, isComputable?) => {
    const _self = this;
    let condition;
    if (rule.condition) {
      condition = _self.executeCondition(rule.condition, attrType, defaultPRule);
    }
    if (!isComputable) {
      if (_self.policyType === 'preCondition' || _self.policyType === 'businessValidation') {
        return condition;
      }
      if (condition) {
        if (rule.success) {
          _self.executeAction(rule.success);
        }
      } else {
        if (rule.failure) {
          _self.executeAction(rule.failure);
        }
        if (_self.policyType === 'presentation') {
          if (rule.success && rule.success.statements) {
            _.forEach(rule.success.statements, (statement) => {
              _self.executeDefaultPresentationAssignment(statement);
            });
          }
        }
      }
      return condition;
    } else {
      let execute = true;
      if (condition == false) {
        execute = false
      }
      if (execute && rule.success && rule.success.statements) {
        let value;
        _.forEach(rule.success.statements, (statement) => {
          value = _self.executeStatement(statement);
        });
        return value;
      }
    }
  };

  /* START-- functions for execution of conditions */
  executeCondition = (condition, attrType?, defaultPRule?) => {
    const _self = this;
    if (condition['@type'] === 'logical') {
      return _self.executeLogicalCondition(condition, attrType, defaultPRule);
    } else if (condition['@type'] === 'relational') {
      return _self.executeRelationalCondition(condition, attrType, defaultPRule);
    }
  };

  executeFunction = (evaluable) => {
    const _self = this;
    let value;
    if (null != evaluable && evaluable.statement) {
      _.forEach(evaluable.statement, function (statement) {
        value = _self.executeStatement(statement);
        return value;
      });
    }

    if (null != evaluable && evaluable.conditionList) {
      _.forEach(evaluable.conditionList, function (condition) {
        _self.executeCondition(condition);
      });
    }
    return value;
  }

  executeLogicalCondition = (logicalCondition, attrType?, defaultPRule?) => {
    const _self = this;
    let i, condition, result;

    if (!logicalCondition.conditions
      || logicalCondition.conditions.length === 0) {
      return true;
    }
    if (logicalCondition.type === 'all') {
      for (i = 0; i < logicalCondition.conditions.length; i++) {
        condition = logicalCondition.conditions[i];
        result = _self.executeCondition(condition, attrType, defaultPRule);
        if (!result) {
          return false;
        }
      }
      return true;
    } else if (logicalCondition.type === 'any') {
      for (i = 0; i < logicalCondition.conditions.length; i++) {
        condition = logicalCondition.conditions[i];
        result = _self.executeCondition(condition, attrType, defaultPRule);
        if (result) {
          return true;
        }
      }
      return false;
    }
  };

  executeRelationalCondition = (relationalCondition, attrType, pRule) => {
    const _self = this;
    try {
      let lhs = relationalCondition.lhs;

      let rhs = relationalCondition.rhs;
      let operator = relationalCondition.operator;

      let rhsValues: any = _self.getEvaluableValue(rhs);
      let lhsValues: any = _self.getEvaluableValue(lhs);
      if (!(lhsValues instanceof Array)) {
        if (lhsValues && isNaN(lhsValues) && typeof (lhsValues) == 'string' && lhsValues.indexOf(';') > -1) {
          if (lhsValues.lastIndexOf(';') === lhsValues.length - 1) {
            lhsValues = lhsValues.substring(0, lhsValues.lastIndexOf(';'));
          }
          lhsValues = lhsValues.split(';');
        } else {
          lhsValues = [lhsValues];
        }
      }
      if (!(rhsValues instanceof Array)) {
        if (rhsValues && isNaN(rhsValues) && typeof (rhsValues) == 'string' && rhsValues.indexOf(';') > -1) {
          if (rhsValues.lastIndexOf(';') === rhsValues.length - 1) {
            rhsValues = rhsValues.substring(0, rhsValues.lastIndexOf(';'));
          }
          rhsValues = rhsValues.split(';');
        } else {
          rhsValues = [rhsValues];
        }
      }
      //this is done to make all undefined value as null--START
      rhsValues = _.map(rhsValues, function (a) {
        return (a || a === 0) ? a : null;
      });
      lhsValues = _.map(lhsValues, function (a) {
        return (a || a === 0) ? a : null;
      });
      //this is done to make all undefined value as null--END
      if (operator.expressionType === 'relational') {
        switch (operator.dataType) {
          case 'text':
          case 'boolean':
            return _self.evaluateTextBooleanExpressionList(lhsValues, rhsValues, operator, attrType);
          case 'longtext':
            return _self.evaluateTextBooleanExpressionList(lhsValues, rhsValues, operator, attrType);
          case 'number':
            return _self.evaluateNumberBooleanExpressionList(lhsValues, rhsValues, operator, attrType);
          case 'date':
            // strip time part of date-time from rhsValue
            for (let i = 0; i < rhsValues.length; i++) {
              let date = new Date(rhsValues[i]);
              date.setHours(0, 0, 0, 0);
              if (rhsValues[i]) {
                rhsValues[i] = date.getTime();
              }
            }
            return _self.evaluateDateBooleanExpressionList(lhsValues, rhsValues, operator, attrType);
          case 'dateTime':
          case 'time':
            return _self.evaluateDateBooleanExpressionList(lhsValues, rhsValues, operator, attrType);
          default:
            return true;
        }
      }
    } catch (err) {
      return false;
    }
    return true;
  };
  /* END-- functions for execution of conditions */

  /* START-- functions for execution of actions */
  executeAction = (action) => {
    const _self = this;
    if (action.statements) {
      _.forEach(action.statements, function (statement) {
        _self.executeStatement(statement);
      });
    }
  };

  executeStatement = (statement) => {
    const _self = this;
    if (statement['@type'] === 'presentation_assignment') {
      _self.executePresentationAssignment(statement);
    } else if (statement['@type'] === 'rule') {
      return _self.executeRule(statement, undefined, true);
    } else if (statement['@type'] === "data_assignment") {
      let lhs = _self.getEvaluableValue(statement.lhs);
      let rhs = _self.getEvaluableValue(statement.rhs);
      if (lhs == "temporary") {
        return rhs;
      }
    }
  };

  getEvaluableValue = (evaluable, isMultiple?) => {
    const _self = this;
    let data: any;
    if (evaluable['@type'] === 'variable') {
      if (evaluable.type == "temporary") {
        return "temporary";
      }
      let entity = evaluable.id.substring(0, evaluable.id.indexOf('.'));
      if (entity === "AuxiliaryEntity") {
        entity = _self.auxiliaryEntity;
      }
      if (_self.contextData[entity]) {
        data = _self.contextData[entity][0];
      } else {
        data = _self.contextData;
      }
      let value = _self.getVariableValue(evaluable.id, data);
      if (value && value != null && (evaluable.dataType === 'date' || evaluable.dataType === 'dateTime')) {
        value = new Date(value).getTime();
      }
      else if ((value || value == false) && value != null && (evaluable.dataType === 'boolean')) { // if value is false then converet to string
        value = value.toString();
      }
      return value;
    } else if (evaluable['@type'] === 'variables') {
      let returnValue: any = [];
      _.forEach(evaluable.variables, function (variable) {
        let entity = variable.id.substring(0, variable.id.indexOf('.'));
        if (_self.contextData[entity]) {
          data = _self.contextData[entity][0];
        }
        else {
          data = _self.contextData;
        }
        let value: any = _self.getVariableValue(variable.id, data);
        if (value instanceof Array) {
          !isMultiple && (value = value[0]);
        }
        if (value && value != null && (evaluable.dataType === 'date' || evaluable.dataType === 'dateTime')) {
          value = new Date(value).getTime();
        }
        else if (value && value != null && (evaluable.dataType === 'boolean')) {
          value = value.toString();
        }
        returnValue.push(value);
      });
      return returnValue;
    } else if (evaluable['@type'] === 'literal') {
      return _self.getKeywordValue(evaluable.value, evaluable.type);
    } else if (evaluable['@type'] === 'range') {
      let minValue = _self.getEvaluableValue(evaluable.min);
      let maxValue = _self.getEvaluableValue(evaluable.max);
      return {
        'min': minValue,
        'max': maxValue
      };
    } else if (evaluable['@type'] === 'keyword') {
      return _self.getKeywordValue(evaluable.value, evaluable.type);

    }
    else if (evaluable['@type'] === 'function') {
      return _self.executeFunction(evaluable);
    }
    else if (evaluable['@type'] === 'compute') {
      let lhs, rhs;
      if (evaluable.rhs) {
        rhs = _self.getEvaluableValue(evaluable.rhs);
      }
      if (evaluable.lhs) {
        lhs = _self.getEvaluableValue(evaluable.lhs);
      }
      if (evaluable.operator) {
        return _self.evaluateComputeExpression(evaluable.operator.actualValue, lhs, rhs);
      } else if (lhs) {
        return lhs;
      }
      else if (rhs) {
        return rhs;
      }
    }
  };

  evaluateComputeExpression = (operator, lhs, rhs) => {
    const _self = this;
    switch (operator) {
      case "sumif":
        if (rhs) {
          let value = rhs.reduce(function (total, num) {
            return total + num;
          });
          return value;

        } else if (lhs) {
          let value = lhs.reduce(function (total, num) {
            return total + num;
          });
          return value;
        }
        break;
      default:
        break;
    }
  }

  executePresentationAssignment = (statement) => {
    const _self = this;
    let operator = statement.operator;
    let assignable = statement.lhs;
    let rhsValue = _self.getEvaluableValue(statement.rhs);

    let entity = assignable.id.substring(0, assignable.id.indexOf('.'));
    let attribute = assignable.id.substring(assignable.id.indexOf('.') + 1),
      pRuleMetaData;
    if (operator && operator.actualValue) {
      switch (operator.actualValue) {
        case 'populate':
          let populateValue = rhsValue;
          if (assignable.dataType === 'number') {
            try {
              populateValue = parseFloat(rhsValue);
            } catch (err) {
              populateValue = rhsValue;
            }
          } else {

            populateValue = rhsValue;
          }
          let data = _self.contextData[entity][0];
          _.set(data, attribute, populateValue);
          break;
        case 'hide':
          if (_self.sectionPMetadata) { // in case of section and attribute
            _self.sectionPMetadata.visible = !JSON.parse(rhsValue);
          } else if (_self.pRule && _self.pRule.entityId && !pRuleMetaData && attribute == 'id') {
            _self.pRule.visible = !JSON.parse(rhsValue);
          } else if (_self.pRule && _self.pRule.presentationRules && _self.pRule.presentationRules[attribute]) {
            pRuleMetaData = _self.pRule.presentationRules[attribute];
            pRuleMetaData.visible = !JSON.parse(rhsValue);
          } else {
            _self.contextData.$$visible = !JSON.parse(rhsValue);
          }

          break;
        case 'disable':
          if (_self.pRule && _self.pRule.presentationRules && _self.pRule.presentationRules[attribute]) {
            pRuleMetaData = _self.pRule.presentationRules[attribute];
            pRuleMetaData.readOnly = JSON.parse(rhsValue);
          } else if (_self.sectionPMetadata) {
            _self.sectionPMetadata.readOnly = JSON.parse(rhsValue);
          } else {
            _self.contextData.$$readOnly = !JSON.parse(rhsValue);
          }
          break;
        case 'color':
          if (_self.formData) {
            if (!_self.formData.$$attributeWithColors) _self.formData.$$attributeWithColors = [];
            _self.formData.$$attributeWithColors[attribute] = rhsValue;
          }
          else if (_self.pRule && _self.pRule.presentationRules && _self.pRule.presentationRules[attribute]) {
            pRuleMetaData = _self.pRule.presentationRules[attribute];
            pRuleMetaData.$$color = rhsValue;
            pRuleMetaData.$$attribute = attribute;
          } else if (_self.sectionPMetadata) {
            _self.sectionPMetadata.$$color = rhsValue;
            _self.sectionPMetadata.$$attribute = attribute;
          } else {
            _self.contextData.$$color = rhsValue;
            _self.contextData.$$attribute = attribute;
            if (!_self.contextData.$$attributeWithColors) _self.contextData.$$attributeWithColors = [];
            _self.contextData.$$attributeWithColors[attribute] = rhsValue;
          }
          break;
        case 'Format':
          _self.changeFormat(_self.pRule, _self.contextData, rhsValue);
          break;
        case 'appendStart':
          _self.appendStartFn(_self.pRule, _self.contextData, rhsValue);
          break;
        case 'appendEnd':
          _self.appendEndFn(_self.pRule, _self.contextData, rhsValue);
          break;
        case 'pickAttribute-hyphen':
          _self.pickAttribute(_self.pRule, _self.contextData, rhsValue, '-');
          break;
        case 'pickAttribute-coma':
          rhsValue = _self.getEvaluableValue(statement.rhs, true);
          _self.pickAttribute(_self.pRule, _self.contextData, rhsValue, ',');
          break;
        case 'currency':
        case 'currency-attribute':
          if (_self.pRule && _self.pRule.presentationRules && _self.pRule.presentationRules[attribute]) {
            pRuleMetaData = _self.pRule.presentationRules[attribute];
            _self.addCurrencyToVariable(pRuleMetaData, _self.contextData, rhsValue, operator.actualValue);
          }
          break;
        case 'reset':
          if (_self.pRule && _self.pRule.presentationRules && _self.pRule.presentationRules[attribute]) {
            pRuleMetaData = _self.pRule.presentationRules[attribute];
            _self.reset(pRuleMetaData, _self.contextData, rhsValue, _self.pRule.entityId);
          }
          break;
        case 'populate-attribute':
          if (_self.pRule && _self.pRule.presentationRules && _self.pRule.presentationRules[attribute]) {
            pRuleMetaData = _self.pRule.presentationRules[attribute];
            _self.populateAttribute(pRuleMetaData, _self.contextData, rhsValue, _self.pRule.entityId, assignable.dataType);
          }
          break;
        default:

      }
    }
  };

  populateAttribute = (pRuleMetaData, contextData, rhsValue, entityId, dataType) => {
    const _self = this;
    let populateValue = rhsValue;
    if (dataType === 'number') {
      try {
        populateValue = parseFloat(rhsValue);
      } catch (err) {
        populateValue = rhsValue;
      }
    } else {
      populateValue = rhsValue;
    }
    let data = contextData[entityId][0];
    _.set(data, pRuleMetaData.attrName, populateValue);
  }
  reset = (pRuleMetaData, contextData, rhsValue, entityId) => {
    const _self = this;
    let data;
    if (contextData[entityId]) {
      data = contextData[entityId][0];
      if (data) {
        if (pRuleMetaData.htmlControl === 'number' ||
          pRuleMetaData.htmlControl === 'currency') {
          data[pRuleMetaData.attrName] = 0;
        } else if (pRuleMetaData.entityConsumed) {
          data[pRuleMetaData.attrName] = null;
          if (pRuleMetaData.list) {
            data[_self.getEntityWithPrefixFromPresentation(pRuleMetaData)] = [];
          } else {
            data[_self.getEntityWithPrefixFromPresentation(pRuleMetaData)] = null;
          }

        } else {
          data[pRuleMetaData.attrName] = null;
        }
      }
    }

  };
  getEntityWithPrefixFromPresentation = (presentation) => {
    const _self = this;
    let entityWithPrefix = '';
    if (presentation.entityPrefix) {
      entityWithPrefix = entityWithPrefix + presentation.entityPrefix;
    }
    return entityWithPrefix + presentation.entityConsumed;
  };

  changeFormat = (pRuleMetaData, contextData, rhsValue) => {
    const _self = this;
    switch (rhsValue) {
      case 'year':
        if (contextData && contextData[pRuleMetaData.attrName]) {
          let value = contextData[pRuleMetaData.attrName];
          contextData.$$modifiedValue = moment(value).format('YYYY');
        }
        break;
      case "N/A":
        if (contextData) {
          let value = contextData[pRuleMetaData.attrName];
          contextData.$$modifiedValue = "N/A";
        }
        break;
      case "0":
        if (contextData) {
          let value = contextData[pRuleMetaData.attrName];
          contextData.$$modifiedValue = "0";
        }
        break;
      default:
        if (contextData) {
          let value = contextData[pRuleMetaData.attrName];
          contextData.$$modifiedValue = rhsValue;
        }
    }
  };
  addCurrencyToVariable = (pRuleMetaData, contextData, rhsValue, operator) => {
    const _self = this;
    if (rhsValue && contextData) {
      if (rhsValue instanceof Array) {
        rhsValue = rhsValue[0];
      }
      let selected;
      switch (rhsValue) {
        case 'Dollar':
        case 'dollar':
          selected = "<i class='fa fas fa-dollar-sign' aria-hidden='true'></i>";
          break;
        case 'Pound':
          selected = "<i class='fa fas fa-pound-sign' aria-hidden='true'></i>";
          break;
        case 'Ghanaian cedi':
        case 'cedi':
          selected = "<span>GH &#8373;</span>";
          break;
        case 'Indian Rupee':
        case 'Rupee':
        case 'rupee':
        case 'Rupees':
        case 'rupees':
          selected = "<i class='fa fas fa-rupee-sign' aria-hidden='true'></i>";
          break;
        default:
          selected = rhsValue;
      }

      if (!pRuleMetaData.uiSettings) {
        pRuleMetaData.uiSettings = {};
      }
      if (operator == 'currency-attribute') {
        pRuleMetaData.uiSettings.prefixType = { type: pRuleMetaData.htmlControl, value: operator, selected: selected };
      } else if (operator == 'currency') {
        pRuleMetaData.uiSettings.prefixType = { type: pRuleMetaData.htmlControl, value: "Currency", selected: selected };
      }
    }

  };
  pickAttribute = (pRuleMetaData, contextData, rhsValue, delimiter) => {
    const _self = this;
    if (rhsValue && contextData) {
      let join = "";
      if (rhsValue instanceof Array) {
        _.forEach(rhsValue, function (value) {
          if (value) {
            join = join + value + delimiter;
          }
        });
        contextData.$$modifiedValue = join;
        if (contextData.$$modifiedValue[contextData.$$modifiedValue.length - 1] == delimiter) {
          contextData.$$modifiedValue = _.trimEnd(contextData.$$modifiedValue, delimiter)
        }
      }
      join = _.trimEnd(join, delimiter);
      if (join == "") {
        contextData.$$modifiedValue = null;
      }
    }

  };

  appendStartFn = (pRuleMetaData, contextData, rhsValue) => {
    const _self = this;
    if (contextData && contextData[pRuleMetaData.attrName]) {
      let value = contextData[pRuleMetaData.attrName];
      contextData.$$modifiedValue = rhsValue + value;
    }
  };
  appendEndFn = (pRuleMetaData, contextData, rhsValue) => {
    const _self = this;
    if (contextData && contextData[pRuleMetaData.attrName]) {
      let value = contextData[pRuleMetaData.attrName];
      contextData.$$modifiedValue = value + rhsValue;
    }
  };
  executeDefaultPresentationAssignment = (statement) => {
    const _self = this;
    let operator = statement.operator;
    let assignable = statement.lhs;
    let entity = assignable.id.substring(0, assignable.id.indexOf('.'));
    let attribute = assignable.id.substring(assignable.id.indexOf('.') + 1),
      pRuleMetaData, defaultPRuleMetaData;
    switch (operator.actualValue) {
      case 'hide':
        if (_self.sectionDefaultPRuleMetaData) {
          _self.sectionPMetadata.visible = _self.sectionDefaultPRuleMetaData.visible;
        } else if (_self.pRule && _self.pRule.entityId && !pRuleMetaData && attribute == 'id') {
          _self.pRule.visible = _self.defaultPRule.visible;
        }
        else if (_self.pRule && _self.pRule.presentationRules && _self.pRule.presentationRules[attribute]) {
          pRuleMetaData = _self.pRule.presentationRules[attribute];
        }
        else {
          if (_self.defaultPRule) {
            defaultPRuleMetaData = _self.defaultPRule.presentationRules[attribute];
          }
          if (defaultPRuleMetaData) {
            pRuleMetaData.visible = defaultPRuleMetaData.visible;
          }
        }
        break;
      case 'disable':
        if (_self.pRule && _self.pRule.presentationRules && _self.pRule.presentationRules[attribute]) {
          pRuleMetaData = _self.pRule.presentationRules[attribute];
        }
        if (_self.sectionDefaultPRuleMetaData) {
          _self.sectionPMetadata.readOnly = _self.sectionDefaultPRuleMetaData.readOnly;
        } else {
          if (_self.defaultPRule)
            defaultPRuleMetaData = _self.defaultPRule.presentationRules[attribute];
          if (defaultPRuleMetaData) {
            pRuleMetaData.readOnly = defaultPRuleMetaData.readOnly;
          }
        }
        break;
      case 'color':
        if (_self.pRule && _self.pRule.presentationRules && _self.pRule.presentationRules[attribute]) {
          pRuleMetaData = _self.pRule.presentationRules[attribute];
        }
        if (_self.sectionDefaultPRuleMetaData) {
          _self.sectionPMetadata.$$color = _self.sectionDefaultPRuleMetaData.$$color;
          _self.sectionPMetadata.$$attribute = attribute;
          if (_self.formData) {
            // formData.$$color = sectionDefaultPRuleMetaData.$$color;
            // formData.$$attribute = attribute;
            if (!_self.formData.$$attributeWithColors) _self.formData.$$attributeWithColors = [];
            _self.formData.$$attributeWithColors[attribute] = _self.sectionDefaultPRuleMetaData.$$color;
          }
        } else {
          if (_self.defaultPRule)
            defaultPRuleMetaData = _self.defaultPRule.presentationRules[attribute];
          if (defaultPRuleMetaData) {
            pRuleMetaData.$$color = defaultPRuleMetaData.$$color;
            pRuleMetaData.$$attribute = attribute;
            if (_self.formData) {
              // formData.$$color = defaultPRuleMetaData.$$color;
              // formData.$$attribute = attribute;
              if (!_self.formData.$$attributeWithColors) _self.formData.$$attributeWithColors = [];
              _self.formData.$$attributeWithColors[attribute] = defaultPRuleMetaData.$$color;
            }
          }
        }
        break;
      default:
    }
  };
  /* END-- functions for execution of actions */

  evaluateTextBooleanExpressionList = (lhsValues, rhsValues, operator, attrType) => {
    const _self = this;
    try {
      let any = (operator.listOperatorType && operator.listOperatorType.toLowerCase() === 'any') ? true : false;
      let all = (operator.listOperatorType && operator.listOperatorType.toLowerCase() === 'all') ? true : false;
      if (!all && !any) {
        all = true;
      }
      let condition = false;
      for (let i = 0; i < lhsValues.length; i++) {
        let check = false;
        for (let j = 0; j < rhsValues.length; j++) {
          let lhsValue = lhsValues[i];
          let rhsValue = rhsValues[j];
          switch (operator.actualValue) {
            case '==':
              condition = (lhsValue === rhsValue);
              break;
            case '!=':
              condition = (lhsValue !== rhsValue);
              break;
            case 'contains':
              condition = (lhsValue.includes(rhsValue));
              break;
            case 'not contains':
              condition = (!lhsValue.includes(rhsValue));
              break;
            case 'starts with':
              condition = (lhsValue.startsWith(rhsValue));
              break;
            case 'ends with':
              condition = (lhsValue.endsWith(rhsValue));
              break;
            default:
              condition = false;
          }
          if (condition && any) {
            return true;
          }
          else if (condition && all) {
            check = true;
          }
          /*else if (!condition && !any) {
            return false;
          }*/
        }
        if (any) {
          continue;
        }
        else if (!check) {
          return false;
        } else {
          check = false;
          condition = true;
        }
      }
      return condition;
    } catch (err) {
      return false;
    }
  };

  evaluateNumberBooleanExpressionList = (lhsValues, rhsValues, operator, attrType) => {
    const _self = this;
    try {
      let any = (operator.listOperatorType && operator.listOperatorType.toLowerCase() === 'any') ? true : false;
      let all = (operator.listOperatorType && operator.listOperatorType.toLowerCase() === 'all') ? true : false;
      if (!all && !any) {
        all = true;
      }
      let condition = false;
      for (let i = 0; i < lhsValues.length; i++) {
        let check = false;
        for (let j = 0; j < rhsValues.length; j++) {
          let lhsValue = lhsValues[i];
          let rhsValue = rhsValues[j];
          switch (operator.actualValue) {
            case '==':
              condition = (lhsValue == rhsValue);
              break;
            case '!=':
              condition = (lhsValue != rhsValue);
              break;
            case '>':
              condition = (lhsValue > rhsValue);
              break;
            case '<':
              condition = (lhsValue < rhsValue);
              break;
            case '>=':
              condition = (lhsValue >= rhsValue);
              break;
            case '<=':
              condition = (lhsValue <= rhsValue);
              break;
            case 'range':
              condition = (rhsValue.min < lhsValue && lhsValue < rhsValue.max);
              break;
            case 'notinrange':
              condition = (rhsValue.min > lhsValue || lhsValue > rhsValue.max);
              break;
            case 'rangeInclusive':
              condition = (rhsValue.min <= lhsValue && lhsValue <= rhsValue.max);
              break;
            default:
              return false;
          }
          if (condition && any) {
            return true;
          }
          else if (condition && all) {
            check = true;
          }
          /*else if (!condition && !any) {
            return false;
          }*/
        }
        if (any) {
          continue;
        }
        else if (!check) {
          return false;
        } else {
          check = false;
          condition = true;
        }
      }
      return condition;
    } catch (err) {
      return false;
    }
  }

  evaluateDateBooleanExpressionList = (lhsValues, rhsValues, operator, attrType) => {
    const _self = this;
    try {
      let any = (operator.listOperatorType && operator.listOperatorType.toLowerCase() === 'any') ? true : false;
      let all = (operator.listOperatorType && operator.listOperatorType.toLowerCase() === 'all') ? true : false;
      if (!all && !any) {
        all = true;
      }
      let condition = false;
      for (let i = 0; i < lhsValues.length; i++) {
        let check = false;
        for (let j = 0; j < rhsValues.length; j++) {

          let lhsValue = lhsValues[i];
          let rhsValue = rhsValues[j];
          switch (operator.actualValue) {
            case '==':
              condition = (lhsValue === rhsValue);
              break;
            case '!=':
              condition = (lhsValue !== rhsValue);
              break;
            case '>':
              condition = (lhsValue > rhsValue);
              break;
            case '<':
              condition = (lhsValue < rhsValue);
              break;
            case '>=':
              condition = (lhsValue >= rhsValue);
              break;
            case '<=':
              condition = (lhsValue <= rhsValue);
              break;
            case 'range':
              condition = (rhsValue.min < lhsValue && lhsValue < rhsValue.max);
              break;
            case 'notinrange':
              condition = (rhsValue.min > lhsValue || lhsValue > rhsValue.max);
              break;
            case 'rangeInclusive':
              condition = (rhsValue.min <= lhsValue && lhsValue <= rhsValue.max);
              break;
            default:
              return false;
          }
          if (condition && any) {
            return true;
          }
          else if (condition && all) {
            if (attrType === 'nonField') {
              return true;
            }
            check = true;
          }
          /*else if (!condition && !any) {
            return false;
          }
          if (condition && any) {
            return true;
          }
          if (!condition && !any) {
                if(attrType==='nonField'){
                    return true;
                }
            return false;
            }*/
        }
        if (any) {
          continue;
        }
        else if (!check) {
          return false;
        } else {
          check = false;
          condition = true;
        }
      }
      return condition;
    } catch (err) {
      return false;
    }
  };

  getKeywordValue = (keyword, type) => {
    const _self = this;
    let NULL = 'null';
    let TODAY = 'today';
    if (keyword === NULL) {
      return null;
    } else if (keyword.startsWith(TODAY)) {
      let todayDate = new Date();
      let delta = keyword.replace(TODAY, '');
      if (delta && delta !== '') {
        todayDate.setDate(todayDate.getDate() + parseInt(delta));
      }
      if (delta && delta.split('-').length > 1) {
        todayDate = moment(moment(todayDate).subtract(delta.split('-')[1], 'days')).toDate();
      }
      if (delta && delta.split('+').length > 1) {
        todayDate = moment(moment(todayDate).add(delta.split('+')[1], 'days')).toDate();
      }
      if (!type || type == 'date') {
        return moment(todayDate).startOf('day').toDate().getTime();
      } else {
        return todayDate.getTime();
      }
    }
    return keyword;
  };

  getComputeValue = (expressions, contextData) => {
    const _self = this;
    expressions = _.trim(expressions);
    if (expressions.indexOf("sumif") != -1) {
      let expression = _.trimStart(expressions, 'sumif[');
      expression = _.trimStart(expression);
      expression = _.trimEnd(expression, ']');
      expression = "Test_1.EmbedTwo_5.codenumber";
      let entity = expression.substring(0, expression.indexOf('.'));
      let data;
      if (contextData[entity]) {
        data = contextData[entity][0];
      }
      else {
        data = contextData;
      }
      let value = _self.getVariableValue(expression, data);
      let result = 0;
      _.forEach(value, function (num) {
        result = result + num;
      });
      return result;
    }
  };

  getContextVariable = (type, context, variable, data) => {
    const _self = this;
    if (!context)
      return null;
    let contextVariable = variable.replace(type + ".", "");
    let entity = contextVariable.substring(0, contextVariable.indexOf("."))
    if (context && context[entity] && context[entity][0]) {
      return _self.getVariableValue(contextVariable, context[entity][0]);
    }
    return null;
  };

  getVariableValue = (variable, data) => {
    const _self = this;
    if (variable === null) return null;
    if (variable === '') return '';
    if (variable.startsWith("UserContext")) {
      // return _self.getContextVariable("UserContext", _self.dataService.getUserContext(), variable, data);
    } else if (variable.startsWith("ApplicationContext")) {
      // return _self.getContextVariable("ApplicationContext", _self.dataService.getApplicationContext(), variable, data);
    }
    let attributes = variable.split('.');
    if (attributes.length == 2) {
      let val = _.get(data, attributes[1]);
      if (val === undefined) {
        return null;
      }
      // if(!_.get(data, attributes[1])){
      // 	return null;
      // }
      return _.get(data, attributes[1]);
    }
    let local = _.get(data, attributes[1]);
    attributes.shift();
    if (local instanceof Array) {
      let toReturn: any = [];
      for (let i = 0; i < local.length; i++) {
        let result = _self.getVariableValue(attributes.join('.'), local[i]);
        if (result instanceof Array) {
          toReturn = toReturn.concat(result);
        } else {
          toReturn.push(result);
        }
      }
      return toReturn;
    }
    return _self.getVariableValue(attributes.join('.'), local);
  };

  parseNumberAsFloat = (data) => {
    if (data.min) {
      data.min = parseFloat(data.min);
      data.max = parseFloat(data.max);
      return data;
    } else {
      return parseFloat(data);
    }
  };

  fetchImmediateFormPresentationsInside = (presentationRules, result) => {
    const _self = this;
    if (!result) {
      result = [];
    }
    _.each(presentationRules, function (pMetaData) {
      if (pMetaData['@type'] == "FormPresentation") {
        result.push(pMetaData.presentationRule);
      }
      if (pMetaData && pMetaData['@type'] === 'SectionPresentation') {
        result = _self.fetchImmediateFormPresentationsInside(pMetaData.presentationRules, result);
      }
    });
    return result;
  };

  checkActionPolicies = (currentPresentation, contextData, formData) => {
    const _self = this;
    if (!_.isEmpty(currentPresentation.actions)) {
      currentPresentation.$$disableAdd = false;
      currentPresentation.$$disableEdit = false;
      currentPresentation.$$disableSave = false;
      currentPresentation.$$disableRemove = false;
      currentPresentation.$$disableReset = false;
      _.forEach(currentPresentation.actions, function (action) {
        action.$$disabled = false;
      });
    }
    _.forEach(currentPresentation.actions, function (action) {
      if (action.policy && action.policy.rules) {
        action.policy.type = "preCondition";
        if (action.actionName == 'add') {
          currentPresentation.$$disableAdd = !_self.executePolicy(action.policy);
        }
        else if (action.actionName == 'edit') {
          currentPresentation.$$disableEdit = !_self.executePolicy(action.policy);
          currentPresentation.$$disableSave = action.$$disableEdit;
          if (formData) {
            formData.$$disableEdit = currentPresentation.$$disableEdit
            formData.$$disableSave = action.$$disableEdit;
          }
        }
        else if (action.actionName == 'remove') {
          currentPresentation.$$disableRemove = !_self.executePolicy(action.policy);
          if (formData) {
            formData.$$disableRemove = currentPresentation.$$disableRemove;
          }
        } else if (action.actionName == 'reset') {
          currentPresentation.$$disableReset = !_self.executePolicy(action.policy);
          if (formData) {
            formData.$$disableReset = currentPresentation.$$disableReset;
          }
        } else if (!action.$$disabled) {
          action.$$disabled = !_self.executePolicy(action.policy);
        }
        console.log(action.actionName + ':->' + action.$$disabled);
      }
    });
  }

}

export default new PolicyExecution();