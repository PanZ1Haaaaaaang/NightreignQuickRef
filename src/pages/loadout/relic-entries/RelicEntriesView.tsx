import type { PageTabProps } from '../../../config/navigationConfig';
import EntryDetailView from '../../entries/EntryDetailView';

const RelicEntriesView = (props: PageTabProps) => <EntryDetailView {...props} scope="局外" />;

export default RelicEntriesView;
