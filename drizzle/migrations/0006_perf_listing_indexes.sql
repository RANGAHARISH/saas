CREATE INDEX "project_status_date_idx" ON "project" USING btree ("launch_status","scheduled_launch_date");--> statement-breakpoint
CREATE INDEX "project_daily_ranking_idx" ON "project" USING btree ("daily_ranking");--> statement-breakpoint
CREATE INDEX "project_created_by_idx" ON "project" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "upvote_project_user_idx" ON "upvote" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "upvote_user_idx" ON "upvote" USING btree ("user_id");