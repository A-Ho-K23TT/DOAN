import asyncHandler from "../utils/asyncHandler.js";
import { getMyApplicationsService, submitApplicationService } from "../services/application.service.js";
import { sendSuccess } from "../utils/response.js";

export const submitApplicationHandler = asyncHandler(async (req, res) => {
  const application = await submitApplicationService({
    ...req.body,
    id_sv: req.user?.sv_id,
    files: req.files || [],
  });
  return sendSuccess(res, "Nộp hồ sơ thành công", application, 201);
});

export const getMyApplicationsHandler = asyncHandler(async (req, res) => {
  const applications = await getMyApplicationsService({ id_sv: req.user.sv_id });
  return sendSuccess(res, "Lấy danh sách hồ sơ của tôi thành công", applications);
});