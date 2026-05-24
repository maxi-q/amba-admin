import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ORD_COPY } from "../ord.constants";

const tabInactive =
  "relative pb-3 pt-0 text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground";
const tabActive =
  "relative pb-3 pt-0 text-[15px] font-semibold text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary";

export const OrdHeader = () => {
  const location = useLocation();
  const params = useParams();

  const slug =
    params.slug || location.pathname.split("/rooms/")[1]?.split("/")[0] || "";

  const { isContractsTab, isProfileTab, isTemplatesTab } = useMemo(() => {
    if (!slug) return { isContractsTab: false, isProfileTab: false, isTemplatesTab: false };
    const p = location.pathname;
    const base = `/rooms/${slug}/ord`;
    const isProfile = p.includes(`${base}/profile`);
    const isTemplates = p.includes(`${base}/templates`) || p.includes(`${base}/template-links`);
    const isContracts = p.includes(base) && !isProfile && !isTemplates;
    return { isContractsTab: isContracts, isProfileTab: isProfile, isTemplatesTab: isTemplates };
  }, [location.pathname, slug]);

  if (!slug) return null;

  return (
    <div className="mb-2 border-b border-border">
      <nav className="flex flex-wrap gap-6" aria-label="Раздел ОРД">
        <Link
          to={`/rooms/${slug}/ord`}
          className={isContractsTab ? tabActive : tabInactive}
        >
          {ORD_COPY.contractsTab}
        </Link>
        <Link
          to={`/rooms/${slug}/ord/templates`}
          className={isTemplatesTab ? tabActive : tabInactive}
        >
          {ORD_COPY.templatesTab}
        </Link>
        <Link
          to={`/rooms/${slug}/ord/profile`}
          className={isProfileTab ? tabActive : tabInactive}
        >
          {ORD_COPY.profileTab}
        </Link>
      </nav>
    </div>
  );
};
