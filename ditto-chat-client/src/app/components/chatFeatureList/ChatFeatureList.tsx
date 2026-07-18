import { IoSearchOutline, IoCallOutline, IoVideocamOutline } from "react-icons/io5";
import { IoIosMore } from "react-icons/io";
import ChatFeatureButton from "../chatFeatureButton/ChatFeatureButton";
import { ListType } from "../../enums/ListType";
import "./ChatFeatureList.css";

interface Props {
	listType: ListType
}

const ICON_SIZE = 24;
const DUMMY_FEATURES = [
	{
		featureName: "Search",
		featureIcon: <IoSearchOutline size={ICON_SIZE} />
	},
	{
		featureName: "Call",
		featureIcon: <IoCallOutline size={ICON_SIZE} />
	},
	{
		featureName: "Video",
		featureIcon: <IoVideocamOutline size={ICON_SIZE} />
	},
	{
		featureName: "More",
		featureIcon: <IoIosMore size={ICON_SIZE} />
	},
];

export default function ChatFeatureList(props: Props) {
	function getListStyleClassName(listType: ListType): string {
		return listType === ListType.ROW ? "list-as-row" : "list-as-column";
	}

	function getMarginBetweenButtons(): React.JSX.Element {
		return props.listType === ListType.ROW
			? <div className="margin-left-2" />
			: <div className="margin-bottom-1" />
	}

	const listStyleClassName = getListStyleClassName(props.listType);
	return <div className={`chat-feature-list ${listStyleClassName}`}>
		{ DUMMY_FEATURES.map(feature => {
			return <>
				<ChatFeatureButton
					parentListType={props.listType}
					chatFeatureName={feature.featureName}
					chatFeatureIcon={feature.featureIcon}
				/>
				{getMarginBetweenButtons()}
			</>
		}) }
	</div>
}
