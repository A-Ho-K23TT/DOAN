import * as applicationService from "./application.service";
import { fetchScholarships } from "./scholarship.service";

/**
 * Fetch scholarships for review
 */
export const fetchScholarshipsForReview = async () => {
  try {
    const scholarships = await fetchScholarships();
    return Array.isArray(scholarships)
      ? scholarships.map((item) => ({
          id: item.id_hb || item.id,
          name: item.tenhb || item.name,
          status: item.trangthai || item.status,
        }))
      : [];
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    throw error;
  }
};

/**
 * Fetch pending applications for a specific scholarship
 */
export const fetchPendingApplicationsByScholarship = async (scholarshipId) => {
  try {
    const { applications } = await applicationService.getScholarshipApplications(scholarshipId);
    return (applications || []).filter((app) => app.trangthai === "pending");
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

/**
 * Fetch detailed review information for an application
 */
export const fetchApplicationReviewDetail = async (applicationId) => {
  try {
    return await applicationService.getApplicationDetail(applicationId);
  } catch (error) {
    console.error("Error fetching application detail:", error);
    throw error;
  }
};

/**
 * Submit application review with field assessments and status
 */
export const submitApplicationReview = async ({
  id_hosodk,
  fieldReviews = [],
  status = "pending",
  ly_do_tu_choi = "",
  id_ad = 1,
}) => {
  try {
    // Save field reviews
    await applicationService.saveReview({
      id_hosodk,
      fieldReviews,
      id_ad,
    });

    // Update application status
    await applicationService.updateStatus({
      id_hosodk,
      status,
      ly_do_tu_choi,
    });

    return true;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};
