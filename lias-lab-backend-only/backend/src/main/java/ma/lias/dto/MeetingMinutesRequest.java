package ma.lias.dto;

import jakarta.validation.constraints.NotBlank;

public record MeetingMinutesRequest(@NotBlank String content) {}
