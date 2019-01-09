const ApplyInterfaceDirective = require('./apply-interface');
const CreateDirective = require('./create');
const RequiresAuthDirective = require('./requires-auth');
const SetAndUpdateDirective = require('./set-and-update');
const UpdateDirective = require('./update');

module.exports = {
  applyInterfaceFields: ApplyInterfaceDirective,
  create: CreateDirective,
  requiresAuth: RequiresAuthDirective,
  setAndUpdate: SetAndUpdateDirective,
  update: UpdateDirective,
};
