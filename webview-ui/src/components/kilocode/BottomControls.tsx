import React from "react"
// import { vscode } from "../../utils/vscode" // kilocode_change: unused
// import { useAppTranslation } from "@/i18n/TranslationContext" // kilocode_change: unused
import KiloRulesToggleModal from "./rules/KiloRulesToggleModal"
// import BottomButton from "./BottomButton" // kilocode_change: unused
import { BottomApiConfig } from "./BottomApiConfig" // kilocode_change

interface BottomControlsProps {
	showApiConfig?: boolean
}

const BottomControls: React.FC<BottomControlsProps> = ({ showApiConfig = false }) => {
	// const { t } = useAppTranslation() // kilocode_change: unused

	// const showFeedbackOptions = () => { // kilocode_change: unused
	//	vscode.postMessage({ type: "showFeedbackOptions" })
	// }

	return (
		<div className="flex flex-row w-auto items-center justify-between h-[30px] mx-3.5 mt-2.5 mb-1 gap-1">
			<div className="flex flex-item flex-row justify-start gap-1 grow overflow-hidden">
				{showApiConfig && <BottomApiConfig />}
			</div>
			<div className="flex flex-row justify-end w-auto">
				<div className="flex items-center gap-1">
					<KiloRulesToggleModal />
					{/* 隐藏反馈按钮 */}
					{/* <BottomButton
						iconClass="codicon-feedback"
						title={t("common:feedback.title")}
						onClick={showFeedbackOptions}
					/> */}
				</div>
			</div>
		</div>
	)
}

export default BottomControls
