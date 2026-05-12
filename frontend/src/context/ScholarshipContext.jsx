import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
	listScholarships as apiListScholarships,
	loginStudent as apiLoginStudent,
	listApplicationsByStudent as apiListApplicationsByStudent,
	getFilesByScholarship as apiGetFilesByScholarship,
	getFormByScholarship as apiGetFormByScholarship,
	submitScholarshipApplication as apiSubmitScholarshipApplication,
} from "../services/student.service";

const ScholarshipContext = createContext(null);
const SESSION_KEY = `qlhb_student_session`;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getScholarshipPriority = (scholarship) => {
	const now = Date.now();
	const deadline = scholarship.han ? new Date(scholarship.han).getTime() : null;
	const isClosedByDate = !deadline || Number.isNaN(deadline) ? false : deadline < now;
	const isClosed = scholarship.trangthai === "da_dong" || isClosedByDate;

	if (isClosed) {
		return { group: 2, text: "Hết hạn", color: "expired", deadlineTs: deadline || Number.MAX_SAFE_INTEGER };
	}

	const diffDays = deadline ? Math.ceil((deadline - now) / DAY_IN_MS) : 3650;
	if (diffDays <= 7) {
		return {
			group: 0,
			text: `Sắp hết hạn (${Math.max(diffDays, 0)} ngay)`,
			color: "expiring",
			deadlineTs: deadline || Number.MAX_SAFE_INTEGER,
		};
	}

	return { group: 1, text: "Còn hạn", color: "active", deadlineTs: deadline || Number.MAX_SAFE_INTEGER };
};

const mapResultBadge = (application) => {
	if (!application) return null;
	if (application.ketqua || application.trangthai === "awarded") return { tone: "pass", text: "Đạt" };
	if (["failed", "rejected"].includes(application.trangthai)) return { tone: "fail", text: "Trượt" };
	return null;
};

const buildSessionUser = (raw) => {
	if (!raw) return null;
	// Expect stored object { token, profile }
	const profile = raw.profile || raw;
	if (!profile?.id_nd || profile.vaitro !== "sv") return null;

	// Normalize profile fields for backward compatibility:
	// - Ensure top-level ngaysinh/gioitinh/trangthai exist
	// - Ensure `studentAcademic` field exists (from backend). Add `academic` alias used elsewhere.
	const normalized = {
		...profile,
		ngaysinh: profile.ngaysinh || profile.birthdate || null,
		gioitinh: profile.gioitinh || profile.gender || null,
		trangthai: profile.trangthai !== undefined ? profile.trangthai : profile.status ?? null,
		studentProfile: profile.studentProfile || profile.sinhvien || null,
		studentAcademic: profile.studentAcademic || profile.academic || null,
	};

	// Keep legacy `academic` key for old components that expect it
	if (!normalized.academic) normalized.academic = normalized.studentAcademic;

	return normalized;
};

const readStoredSessionUser = () => {
	if (typeof window === "undefined") return null;

	try {
		const rawSession = localStorage.getItem(SESSION_KEY);
		if (!rawSession) return null;

		const parsed = JSON.parse(rawSession);
		return buildSessionUser(parsed);
	} catch {
		return null;
	}
};

export const ScholarshipProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [scholarships, setScholarships] = useState([]);
	const [myApplications, setMyApplications] = useState([]);
	const [filesMap, setFilesMap] = useState(new Map());
	const [formsMap, setFormsMap] = useState(new Map());
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();
	const activeUser = useMemo(() => currentUser || readStoredSessionUser(), [currentUser]);

	const refreshScholarships = useCallback(async () => {
		const rows = await apiListScholarships();
		setScholarships(rows || []);
		return rows || [];
	}, []);

	const refreshMyApplications = useCallback(async (nextUser = activeUser) => {
		if (!nextUser?.studentProfile?.sv_id) {
			setMyApplications([]);
			return [];
		}

		const rows = await apiListApplicationsByStudent();
		setMyApplications(rows || []);
		return rows || [];
	}, [activeUser]);

	useEffect(() => {
		(async () => {
			await refreshScholarships();

			const rawSession = localStorage.getItem(SESSION_KEY);
			if (!rawSession) return;

			try {
				const parsed = JSON.parse(rawSession);
				const nextUser = buildSessionUser(parsed);
				if (nextUser) {
					setCurrentUser(nextUser);
					try {
						const rows = await apiListApplicationsByStudent();
						setMyApplications(rows || []);
					} catch (e) {
						setMyApplications([]);
					}
				}
			} catch {
				localStorage.removeItem(SESSION_KEY);
			}
		})();
		// run only once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const studentScholarships = useMemo(() => {
		const byScholarship = new Map(myApplications.map((item) => [Number(item.id_hb), item]));

		return scholarships
			.map((scholarship) => {
				const priority = getScholarshipPriority(scholarship);
				const application = byScholarship.get(Number(scholarship.id_hb)) || null;

				return {
					...scholarship,
					priority,
					application,
					resultBadge: mapResultBadge(application),
				};
			})
			.sort((a, b) => {
				if (a.priority.group !== b.priority.group) return a.priority.group - b.priority.group;
				if (a.priority.group === 0 || a.priority.group === 1) {
					return a.priority.deadlineTs - b.priority.deadlineTs;
				}
				return b.priority.deadlineTs - a.priority.deadlineTs;
			});
	}, [scholarships, myApplications]);

	const scholarshipMap = useMemo(() => {
		return new Map(studentScholarships.map((item) => [Number(item.id_hb), item]));
	}, [studentScholarships]);

	const login = async (credentials) => {
		try {
			const user = await apiLoginStudent(credentials.tendangnhap, credentials.matkhau);
			if (!user) throw new Error('Đăng nhập thất bại');
			setCurrentUser(user);
			setIsUserMenuOpen(false);
			// apiLoginStudent already stored session token/profile
			await refreshMyApplications(user);
			toast.success("Dang nhap thanh cong");

			const redirectTo = location.state?.from || "/";
			window.setTimeout(() => {
				navigate(redirectTo, { replace: true });
			}, 0);
			return true;
		} catch (error) {
			toast.error(error.message || "Đăng nhập thất bại");
			return false;
		}
	};

	const logout = () => {
		setCurrentUser(null);
		setMyApplications([]);
		setIsUserMenuOpen(false);
		localStorage.removeItem(SESSION_KEY);
		toast.info("Ban da dang xuat");
			navigate("/", { replace: true });
	};

	const requireLogin = (redirectPath = location.pathname) => {
		if (activeUser) return true;

		toast.warn("Ban chua dang nhap");
		navigate("/login", { state: { from: redirectPath } });
		return false;
	};

	const getScholarshipById = (id) => scholarshipMap.get(Number(id)) || null;

	const fetchFilesAndCache = async (id_hb) => {
		try {
			const rows = await apiGetFilesByScholarship(Number(id_hb));
			setFilesMap((m) => new Map(m).set(Number(id_hb), rows || []));
			return rows || [];
		} catch (e) {
			return [];
		}
	};

	const getScholarshipFiles = (id_hb) => {
		const cached = filesMap.get(Number(id_hb));
		if (cached) return cached;
		// trigger background fetch
		fetchFilesAndCache(id_hb);
		return [];
	};

	const fetchFormAndCache = async (id_hb) => {
		try {
			const form = await apiGetFormByScholarship(Number(id_hb));
			setFormsMap((m) => new Map(m).set(Number(id_hb), form || { title: "", description: "", fields: [] }));
			return form || { title: "", description: "", fields: [] };
		} catch (e) {
			return { title: "", description: "", fields: [] };
		}
	};

	const getScholarshipForm = (id_hb) => {
		const cached = formsMap.get(Number(id_hb));
		if (cached) return cached;
		fetchFormAndCache(id_hb);
		return { title: "", description: "", fields: [] };
	};

	const getApplicationByScholarship = (id_hb) => {
		if (!activeUser?.studentProfile?.sv_id) return null;

		const fromState = myApplications.find((item) => Number(item.id_hb) === Number(id_hb));
		if (fromState) return fromState;

		return null;
	};

	const buildSubmissionFormData = (id_hb, id_sv, dataJson) => {
		const formData = new FormData();
		const sanitizedAnswers = {};

		Object.entries(dataJson || {}).forEach(([qId, value]) => {
			// Handle single file (backward compatibility)
			if (value && typeof File !== "undefined" && value.file instanceof File) {
				const { file, ...rest } = value;
				sanitizedAnswers[qId] = rest;
				formData.append(`file_${qId}`, file, file.name);
				return;
			}

			// Handle multiple files (new format - array of file objects)
			if (Array.isArray(value) && value.length > 0 && value[0]?.file instanceof File) {
				const filesWithoutFile = value.map(({ file, ...rest }) => rest);
				sanitizedAnswers[qId] = filesWithoutFile;
				value.forEach((fileObj, index) => {
					formData.append(`file_${qId}`, fileObj.file, fileObj.file.name);
				});
				return;
			}

			sanitizedAnswers[qId] = value;
		});

		formData.append("id_hb", String(id_hb));
		formData.append("id_sv", String(id_sv));
		formData.append("data_json", JSON.stringify(sanitizedAnswers));

		return formData;
	};

	const submitApplication = async (id_hb, dataJson) => {
		if (!activeUser?.studentProfile?.sv_id) {
			toast.error("Bạn cần đăng nhập để nộp hồ sơ");
			return null;
		}
		try {
			const payload = buildSubmissionFormData(Number(id_hb), activeUser.studentProfile.sv_id, dataJson);

			const result = await apiSubmitScholarshipApplication(payload);

			await refreshMyApplications();
			await refreshScholarships();
			return result;
		} catch (error) {
			toast.error(error.message || "Nop ho so that bai");
			return null;
		}
	};

	const changePassword = (_currentPassword, _newPassword) => {
		toast.error("Thay đổi mật khẩu chưa được hỗ trợ");
		return false;
	};

	const value = {
		currentUser: activeUser,
		rawCurrentUser: currentUser,
		scholarships: studentScholarships,
		myApplications,
		isUserMenuOpen,
		setIsUserMenuOpen,
		login,
		logout,
		requireLogin,
		getScholarshipById,
		getScholarshipFiles,
		getScholarshipForm,
		getApplicationByScholarship,
		submitApplication,
		changePassword,
		refreshScholarships,
		refreshMyApplications,
	};

	return <ScholarshipContext.Provider value={value}>{children}</ScholarshipContext.Provider>;
};

export const useScholarship = () => {
	const context = useContext(ScholarshipContext);
	if (!context) {
		throw new Error("useScholarship phai duoc dung ben trong ScholarshipProvider");
	}
	return context;
};

