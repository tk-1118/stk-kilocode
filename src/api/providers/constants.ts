import { Package } from "../../shared/package"

export const DEFAULT_HEADERS = {
	"HTTP-Referer": "https://kilocode.ai",
	"X-Title": "HN Code",
	"X-KiloCode-Version": Package.version,
	"User-Agent": `Kilo-Code/${Package.version}`,
}
