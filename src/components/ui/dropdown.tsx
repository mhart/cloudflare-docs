"use client";

import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	Toast,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from "~/components/ui/toast";
import { DefaultIcon } from "~/components/ui/DefaultIcon";
import { HeartIcon } from "~/components/ui/HeartIcon";
import { V0Icon } from "~/components/ui/V0Icon";
import { BoltIcon } from "~/components/ui/BoltIcon";
import { ReplitIcon } from "~/components/ui/ReplitIcon";
import { ChevronDown, CheckCircle } from "lucide-react";
import { useState, useCallback } from "react";

const options = [
	{
		label: "Basic",
		description: "Standard prompt for AI code editors",
		icon: <DefaultIcon />,
	},
	{
		label: "Replit",
		description: "Optimized for Replit Agent",
		icon: <ReplitIcon />,
	},
	{
		label: "v0 by Vercel",
		description: "Optimized for v0.dev",
		icon: <V0Icon />,
	},
	{
		label: "Lovable",
		description: "Optimized for Lovable.dev",
		icon: <HeartIcon />,
	},
	{
		label: "Bolt.new",
		description: "Optimized for Bolt.new",
		icon: <BoltIcon />,
	},
];

function Component({ copyText }: { copyText: string }) {
	const [selectedIndex, setSelectedIndex] = useState("0");
	const [open, setOpen] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(copyText);
			setOpen(true);
		} catch (error) {
			console.error("Failed to copy text:", error);
		}
	}, [selectedIndex]);

	return (
		<div className="not-content">
			<ToastProvider duration={3000}>
				<div className="inline-flex rounded-lg shadow-sm">
					<Button
						className="rounded-r-none shadow-none rounded-l-lg focus-visible:z-10 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 border-r-0 border border-gray-300 dark:border-gray-700 flex items-center gap-2"
						onClick={handleCopy}
						type="button"
					>
						<div className="flex items-center gap-2">
							<div className="flex items-center justify-center w-[22px] h-[22px]">
								{options[Number(selectedIndex)].icon}
							</div>
							<span>Copy prompt</span>
						</div>
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="rounded-l-none shadow-none rounded-r-lg focus-visible:z-10 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
								size="icon"
								aria-label="Options"
								type="button"
							>
								<ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="max-w-64 md:max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
							side="bottom"
							sideOffset={4}
							align="end"
						>
							<DropdownMenuRadioGroup
								value={selectedIndex}
								onValueChange={setSelectedIndex}
							>
								{options.map((option, index) => (
									<DropdownMenuRadioItem
										key={option.label}
										value={String(index)}
										className="items-start [&>span]:pt-1.5 focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100"
									>
										<div className="flex items-start gap-3">
											<div className="flex items-center justify-center w-[22px] h-[22px]">
												{option.icon}
											</div>
											<div className="flex flex-col gap-0.5">
												<span className="text-sm font-medium">
													{option.label}
												</span>
												<span className="text-xs text-muted-foreground">
													{option.description}
												</span>
											</div>
										</div>
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<Toast open={open} onOpenChange={setOpen}>
					<div className="grid gap-1">
						<ToastTitle className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4" />
							AI prompt copied to clipboard
						</ToastTitle>
					</div>
				</Toast>

				<ToastViewport />
			</ToastProvider>
		</div>
	);
}

export { Component as Dropdown };
