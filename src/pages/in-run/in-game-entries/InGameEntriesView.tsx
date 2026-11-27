import type { PageTabProps } from '../../../config/navigationConfig';
import EntryDetailView from '../../entries/EntryDetailView';

const InGameEntriesView = (props: PageTabProps) => <EntryDetailView {...props} scope="局内" />;

export default InGameEntriesView;
